# Berry Thesis: NEAR as a Settlement Business (v5)

> A long-term case for NEAR: what's verified, what has to be true, and what would prove it wrong.

Live Workspace: [https://github.com/Bigestdave/berrythesis](https://github.com/Bigestdave/berrythesis)
Author: David Olabowale (Independent Researcher)

---

## Long-Term Case

NEAR's strongest long-term argument is not the L1; it is a settlement business. Intents has moved at least **\$11.22B of independently verified stablecoin throughput** across nine 6-decimal USD contracts, and NEAR keeps a slice of it. If that slice grows and is valued as recurring settlement revenue instead of cyclical crypto fees, NEAR is a different business from the one the usage data describes.

Today's price already assumes a lot (151× sales), so the position is conditional: size it by a risk budget, add only on a capture inflection or a sub-100× multiple, and exit if net revenue misses +50% in four quarters.

### Value Chain: How the Rail Connects to NEAR Holders

```
Intents volume ($11.22B verified floor)
  → Gross fee ~15.9 bps (~$61M cumulative) [reported]
    → Protocol capture ~28–30% [reported]
      → Retained take ~3–5 bps (~$11.7M net) [reported]
        → Buybacks <25% of issuance, held not burned [reported]
          → NEAR holders
```

Every link after verified volume is reported, not independently verified. The retained take is the number to watch.

### Key Findings

| Metric | Figure | Provenance |
|---|---|---|
| **Verified Stable Floor** | **\$11.22B** | Reconstructed from BigQuery `ft_events` (29.3% of \$38.26B reported) |
| **Confirmed USD Contracts** | **9 contracts** | Archival RPC probe (`ft_metadata` + `ft_total_supply`) |
| **Gross Take Rate** | **15.9 bps** | ~\$61M cumulative gross fees on routed volume |
| **Retained Take Rate** | **~3–5 bps** | Protocol capture climbing 11.5% → 16.4% → ~28–30% |
| **Price-Free Rail Activity** | **8,622/day** | Nov 1–11 stable settlements (up from 4,600 in Jun-Jul) |
| **Intents Share of L1** | **17.0%** | Nov 1–11 transactions (up from 0.9% in Mar-26) |
| **L1 Active Accounts** | **−74% YoY** | 72k Oct-26 vs 273k Oct-25 |
| **Lead-Lag Testing** | **No detectable lead** | 10,000-shuffle permutation tests; small samples fail to detect, not prove absence |
| **Return Since Fee Switch** | **+251%** | 108% vol, Sharpe 1.62; Sep-2026 supplies 81% of gain |
| **Stance** | **Conditional** | Size by risk budget; add on capture inflection or P/S ≤ 100× |

---

## Project Architecture

This repository pairs the research with an interactive analytics interface:

- **7 Dedicated Views**: Overview, On-chain Analytics (680-day BigQuery chart, 9-contract table, monthly settlements), Market Analysis, Investment Thesis (returns, scenario matrix, falsifiers, comparables), Methodology (honesty ledger, lead-lag tables), Research Notebook, Changelog.
- **Vercel Pitch-Black Design**: Geist Sans, Geist Mono, DM Sans typography; berry-red accents (`#f2416b`).
- **Standalone Offline HTML**: `standalone-preview.html` for zero-dependency exploration.

---

## Local Setup

```bash
git clone https://github.com/Bigestdave/berrythesis.git
cd berrythesis
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### BigQuery Reproduction

Three partition-filtered SQL queries in `scripts/` and the in-app Query Library:
- `01_stable_inflow_daily_by_contract.sql` — stablecoin settlement into `intents.near` via `ft_events`
- `02_daily_active_accounts_and_txs.sql` — L1 active signers and transactions
- `03_daily_contract_usage.sql` — top 25 receiver contracts by volume

### RPC Identity Probe

Verify all nine contracts are genuine 6-decimal USD tokens:
```bash
curl -s https://archival-rpc.mainnet.near.org -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":"1","method":"query","params":{
       "request_type":"call_function","finality":"final",
       "account_id":"usdt.tether-token.near","method_name":"ft_metadata",
       "args_base64":"e30=","encoding":"json"}}'
```

### Intents Explorer API

Not run in this submission (requires partner JWT). BigQuery `ft_events` used instead — it covers all token types, not only 1Click swaps.

---

## License & Attribution

Independent research submission for the NEAR Investment Thesis hackathon track. Not affiliated with NEAR Foundation and not financial advice.
