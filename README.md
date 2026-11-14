# Berry Thesis: NEAR Protocol Investment Research (v5)

> **"NEAR is short its own take rate."**  
> A long-horizon investment thesis on NEAR Protocol, built backwards from documented, on-chain-verified revenue. Hackathon Submission v5.

Live Workspace: [https://github.com/Bigestdave/berrythesis](https://github.com/Bigestdave/berrythesis)  
Author: David Olabowale (Independent Researcher)

---

## Executive Summary

NEAR is valued by the market as a declining L1 and the NEAR Intents settlement rail at approximately zero. Inside that classification sits a settlement and routing rail that has moved **\$11.22B of independently verified stablecoin throughput** across nine 6-decimal USD contracts, earns **~15.9 bps gross / ~3–5 bps retained take**, and carries **zero balance-sheet risk**. 

The investable question is whether the retained take on that rail gets re-classified by financial markets from "cyclical crypto transaction fees" to "recurring, asset-light settlement revenue" (the reclassification that re-rated Visa, LSEG, and ICE).

### Key Verified Findings

| Metric | Figure | Provenance / Verification |
|---|---|---|
| **Verified Stable Floor** | **\$11.22B** | Reconstructed from BigQuery `ft_events` (29.3% of \$38.26B reported volume) |
| **Confirmed USD Contracts** | **9 contracts** | Archival RPC probe (`ft_metadata` + `ft_total_supply`); all confirmed 6-dec USD |
| **Gross Take Rate** | **15.9 bps** | ~$61M cumulative gross fees on routed volume |
| **Retained Take Rate** | **3.05 bps** | Protocol capture climbing 11.5% → 16.4% → ~28–30% (~$11.7M net revenue) |
| **Price-Free Rail Activity** | **8,622 / day** | Nov 1–11 daily stable settlements (stepped up from 4,600 in Jun-Jul 2026) |
| **Intents Share of L1** | **17.0%** | Nov 1–11 transactions (up from 0.9% in Mar-26); 147 median daily callers |
| **L1 Active Accounts** | **-74% YoY** | 72,046 in Oct-26 vs 273,739 in Oct-25 (-92% vs Jan-25 882k) |
| **The Null Result** | **Holds** | 10,000-shuffle permutation tests confirm flow does NOT lead usage (p=0.44–0.75) or price |
| **Return Since Fee Switch** | **+251%** | 108% volatility, Sharpe 1.62, max DD -43.6%; Sep-2026 supplies 81% of gain |
| **Stance & Verdict** | **Under review** | Do not add at \$3.45 (151× sales); accumulate on rules-based triggers (Capture ≥25% or P/S ≤100×) |

---

## Project Architecture & Features

This repository pairs the rigorous research paper with an interactive, institutional-grade analytics interface:

- **Vercel Pitch-Black Design System**: Built with clean neutral borders (`#1f1f1f`), pitch-black canvas (`#000000`), Geist Sans, Geist Mono, and DM Sans typography, and subtle berry-red accents (`#f2416b`).
- **7 Dedicated Analytical Views**:
  - `Overview`: Working thesis question, verified settlement metrics, market snapshot, performance chart, and comparables glance.
  - `On-chain Analytics`: 680-day interactive BigQuery L1 usage chart, reconstructed monthly settlements table (§3), confirmed 9 contracts table with RPC float data (§4).
  - `Market Analysis`: CoinGecko spot data, TVL trends, 151× P/S run-rate context, and Sum-of-the-Parts (SOTP) valuation model.
  - `Investment Thesis`: Full claim, Evidence For vs Evidence Against, Measured Performance Table (§12), Scenario Matrix (§12), Position Sizing by Risk Budget (§12), and the 6 Monthly Monitoring Falsifiers (§9).
  - `Methodology & Data`: Provenance, RPC identity probe code snippet, Honesty Ledger (Verified vs Reported), disclosed query limitations, and 10 claims removed on purpose.
  - `Research Notebook`: 6 categorized notes (Evidence, Risk, Question) with search, filtering, and author provenance.
  - `Changelog`: Complete audit trail of research development from v1 to v5.
- **Standalone Offline HTML**: Includes `standalone-preview.html` (and exported `berry-thesis-redesign-export.html`), allowing zero-dependency offline exploration with fully functional tab switching.

---

## Local Setup & Reproducibility

### 1. Install & Run Locally

```bash
# Clone the repository
git clone https://github.com/Bigestdave/berrythesis.git
cd berrythesis

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 2. BigQuery Reproduction

The 3 core queries used to extract the underlying data are located in `scripts/` and the in-app Query Library:
- `01_stable_inflow_daily_by_contract.sql`: Queries `bigquery-public-data.crypto_near_mainnet_us.ft_events` for inbound stablecoin settlement into `intents.near`.
- `02_daily_active_accounts_and_txs.sql`: Queries `crypto_near_mainnet_us.transactions` for active signers and daily transactions.
- `03_daily_contract_usage.sql`: Identifies the top 25 receiver contracts by transaction volume.

### 3. RPC Identity Probe

To verify that all nine contracts are genuine 6-decimal USD tokens:
```bash
curl -s https://archival-rpc.mainnet.near.org -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":"1","method":"query","params":{
       "request_type":"call_function","finality":"final",
       "account_id":"usdt.tether-token.near","method_name":"ft_metadata",
       "args_base64":"e30=","encoding":"json"}}'
```

---

## License & Attribution

Independent research submission for the NEAR Investment Thesis hackathon track. Not affiliated with NEAR Foundation and not financial advice.
