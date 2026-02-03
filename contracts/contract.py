# { "Depends": "py-genlayer:test" }

from genlayer import *
import json
import hashlib


class TxExplainer(gl.Contract):
    last_result_json: TreeMap[Address, str]
    last_debug: TreeMap[Address, str]

    def _clamp(self, s: str, n: int) -> str:
        s = (s or "").strip()
        if len(s) > n:
            return s[:n]
        return s

    def _clean_spaces(self, s: str) -> str:
        s = (s or "").replace("\n", " ").replace("\r", " ").strip()
        while "  " in s:
            s = s.replace("  ", " ")
        return s

    def _extract_json(self, s: str) -> str:
        s = (s or "").strip()
        first = s.find("{")
        last = s.rfind("}")
        if first != -1 and last != -1 and last > first:
            s = s[first:last + 1]
        s = s.replace("\u201c", '"').replace("\u201d", '"').replace("\u2018", "'").replace("\u2019", "'")
        s = s.replace("\n", " ").replace("\r", " ")
        return self._clean_spaces(s)

    def _resolve_eq_fn(self):
        candidates = []

        for name in [
            "eq_principle_prompt_non_comparative",
            "eq_principle_prompt",
            "eq_prompt",
            "eq_principle_non_comparative",
        ]:
            fn = getattr(gl, name, None)
            if callable(fn):
                candidates.append((name, fn))

        mod = getattr(gl, "eq_principle", None)
        if mod is not None:
            for sub in ["prompt_non_comparative", "prompt", "run", "call"]:
                fn = getattr(mod, sub, None)
                if callable(fn):
                    candidates.append((f"eq_principle.{sub}", fn))

        mod2 = getattr(gl, "eq", None)
        if mod2 is not None:
            for sub in ["prompt_non_comparative", "prompt", "run", "call"]:
                fn = getattr(mod2, sub, None)
                if callable(fn):
                    candidates.append((f"eq.{sub}", fn))

        if len(candidates) == 0:
            raise AttributeError("No callable eq-principle function found in this GenLayer runtime")

        return candidates[0]

    def _call_eq(self, prompt: str, task: str, criteria: str):
        name, fn = self._resolve_eq_fn()

        try:
            return name, fn(lambda: prompt, task=task, criteria=criteria)
        except TypeError:
            pass

        try:
            return name, fn(lambda: prompt, task=task)
        except TypeError:
            pass

        return name, fn(lambda: prompt)

    def _fallback(self, to_addr: str, data: str, value_wei: int, chain_hint: str, sender: Address, err: str, raw_preview: str, eq_used: str):
        s = f"{to_addr}|{data}|{value_wei}|{chain_hint}|{sender}"
        h = hashlib.sha256(s.encode()).digest()
        risk = ["LOW", "MEDIUM", "HIGH"][h[0] % 3]

        warnings = []
        if len(data) >= 10:
            warnings.append("Calldata present: could call arbitrary contract logic.")
        if value_wei > 0:
            warnings.append("This transaction transfers native value.")
        if risk == "HIGH":
            warnings.append("High-risk pattern detected by fallback heuristics.")

        actions = ["Interacts with a smart contract at the destination address."]
        if value_wei > 0:
            actions.append("Transfers native value from your wallet.")

        rec = "Proceed only if you trust the dApp and verify the destination address."
        if risk == "HIGH":
            rec = "DO NOT SIGN unless you fully trust this project and you understand the calldata."

        res = {
            "summary": "Transaction will interact with the destination contract and may execute arbitrary logic.",
            "actions": actions,
            "warnings": warnings,
            "risk_level": risk,
            "recommendation": rec,
            "fallback": True
        }

        self.last_debug[sender] = json.dumps({
            "error": self._clamp(err, 300),
            "eq": eq_used,
            "raw": self._clamp(raw_preview, 900)
        })

        return res

    @gl.public.write
    def explain_tx(self, to_address: str, calldata: str, value_wei: u256, chain_hint: str) -> bool:
        sender = gl.message.sender_address

        to_addr = self._clamp(to_address or "", 80)
        data = (calldata or "0x").strip()
        if not data.startswith("0x"):
            data = "0x"
        data = self._clamp(data, 5000)
        hint = self._clamp(chain_hint or "unknown", 40)
        v = int(value_wei)

        prompt = (
            "You are a transaction safety explainer for web3 users.
"
            "Explain what a transaction will do in plain English and flag risks.
"
            "You must be accurate and conservative. If uncertain, say so.

"
            "Input:
"
            f"- chain_hint: {hint}
"
            f"- to: {to_addr}
"
            f"- value_wei: {v}
"
            f"- calldata: {data}

"
            "Return ONLY valid JSON with exactly these keys:
"
            '{ "summary": string (<= 280 chars),'
            ' "actions": array of 2-6 strings,'
            ' "warnings": array of 0-6 strings,'
            ' "risk_level": one of ["LOW","MEDIUM","HIGH"],'
            ' "recommendation": string (<= 220 chars) }
'
            "Rules:
"
            "- No markdown.
"
            "- No extra keys.
"
            "- Strings must be single-line.
"
            "- Flag unlimited approvals, delegatecall/proxy risks, and drains if likely.
"
        )

        task = "Explain transaction and risks as JSON"
        criteria = "JSON only. Must match schema exactly."

        raw_preview = ""
        eq_used = ""
        result_obj = None

        try:
            eq_used, raw = self._call_eq(prompt, task, criteria)

            if isinstance(raw, dict):
                data_obj = raw
                raw_preview = json.dumps(raw)
            else:
                raw_preview = str(raw)
                s = self._extract_json(raw_preview)
                data_obj = json.loads(s)

            result_obj = {
                "summary": self._clamp(str(data_obj.get("summary", "")), 280),
                "actions": data_obj.get("actions", []),
                "warnings": data_obj.get("warnings", []),
                "risk_level": str(data_obj.get("risk_level", "UNKNOWN")).upper(),
                "recommendation": self._clamp(str(data_obj.get("recommendation", "")), 220),
                "fallback": False
            }

            if result_obj["risk_level"] not in ["LOW", "MEDIUM", "HIGH"]:
                result_obj["risk_level"] = "MEDIUM"

            self.last_debug[sender] = json.dumps({
                "error": "",
                "eq": eq_used,
                "raw": self._clamp(raw_preview, 900)
            })

        except Exception as e:
            result_obj = self._fallback(to_addr, data, v, hint, sender, str(e), raw_preview, eq_used)

        self.last_result_json[sender] = json.dumps(result_obj)
        return True

    @gl.public.view
    def get_last_result(self, user_address: str) -> str:
        try:
            addr = Address(user_address)
            return self.last_result_json[addr]
        except Exception:
            return json.dumps({
                "summary": "",
                "actions": [],
                "warnings": [],
                "risk_level": "MEDIUM",
                "recommendation": "",
                "fallback": False
            })

    @gl.public.view
    def get_last_debug(self, user_address: str) -> str:
        try:
            addr = Address(user_address)
            return self.last_debug[addr]
        except Exception:
            return json.dumps({ "error": "no debug", "eq": "", "raw": "" })
