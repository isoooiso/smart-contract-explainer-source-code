Deploy `contract.py` in GenLayer Studio.

Frontend calls:
- explain_tx(to, calldata, value_wei, chain_hint) -> write
- get_last_result(user) -> view (JSON string)
- get_last_debug(user) -> view (JSON string)

After deployment, set contract address in .env and .env.production.
