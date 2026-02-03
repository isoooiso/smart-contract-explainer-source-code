# AI Smart Contract Explainer (GenLayer)

On-chain AI consensus tool that explains a transaction draft before signing:
- Plain-English summary of intent
- Actions list
- Warnings and red flags
- Risk level (LOW / MEDIUM / HIGH)
- Recommendation (e.g., DO NOT SIGN)

## Install & Run
```bash
npm install
cp .env.example .env
```

Edit `.env`:
```bash
VITE_GENLAYER_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
```

Run:
```bash
npm run dev
```

## Deploy contract
Open `contracts/contract.py` in GenLayer Studio and deploy.
Copy the deployed address into `.env` and `.env.production`.

## GitHub Pages
1) Set `vite.config.js` base to `/<repo-name>/` if needed.
2) Create `.env.production` with the same variables as `.env`.
3) Build:
```bash
npm run build
```
4) Upload the **contents** of `dist/` to your repo root and enable GitHub Pages.

