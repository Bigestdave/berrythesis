# Berry Thesis · NEAR Protocol

> A long-term case for NEAR as a settlement business: what's verified, what has to be true, and what would prove it wrong.

## Long-term case

NEAR's strongest long-term argument is not the L1; it is a settlement business. Intents has moved at least $11.22B of stablecoins through intents.near since January 2025, and NEAR keeps a slice of it. If that slice grows and is valued as recurring settlement revenue instead of cyclical crypto fees, NEAR is a different business from the one the usage data describes. Today's price already assumes a lot (151× sales), so the position is conditional: size it by a risk budget, add only on a capture inflection or a sub-100× multiple, and exit if net revenue misses +50% in four quarters.

## Value chain

How the rail connects to NEAR holders:

```
Intents volume ($11.22B verified floor)
  → Gross fee ~15.9 bps (~$61M cumulative) [reported]
    → Protocol capture ~28–30% [reported]
      → Retained take ~3–5 bps (~$11.7M net) [reported]
        → Buybacks <25% of issuance, held not burned [reported]
          → NEAR holders
```

Every link after verified volume is reported, not independently verified. The retained take is the number to watch.

## Working question

Can the slice NEAR keeps from its Intents settlement rail be valued as recurring, asset-light settlement revenue — the reclassification that re-rated Visa, LSEG, and ICE?

## The case for

- $11.22B verified stablecoin settlement floor into intents.near across nine confirmed 6-decimal USD contracts (29.3% of the $38.26B NEAR reports).
- Price-free rail activity: stable settlements per day stepped from 4,600 (Jun–Jul 26) to 8,622/day (Nov 1–11).
- Intents share of L1 transactions rose from 0.9% (Mar-26) to 17.0% (Nov 1–11), with 147 median daily callers.
- Protocol capture climbing: retained take expanded 11.5% → 16.4% → ~28–30%.
- Historical comparables (Visa, LSEG, ICE, AWS) show markets pay the highest multiples for recurring, asset-light tolls without credit risk.

## The case against

- No detectable lead from flow to network usage (permutation p = 0.44–0.75) or to token price (monthly r = −0.24, p = 0.31). Sample sizes are small (~22 months, ~94 weeks), so this fails to detect a lead rather than proving absence.
- The L1 is shrinking: daily active accounts down −74% YoY. The settlement rail carries the entire investment thesis with no second engine.
- Returns are concentrated: +251% since the fee switch, but September 2026 alone supplies 81% of the gain (Sharpe without it: 0.36).
- Moat is unproven: intent routing is commoditised today (Across ran 10–15 bps with $0 capture).
- Valuation needs a lot to be true: at 151× run-rate sales, a Visa-like 15× multiple needs revenue to grow tenfold.

## What would change the argument

1. Net revenue (not volume) fails to grow ≥ 50% over four quarters → thesis is dead.
2. Protocol capture falls below 15% for two consecutive months → abandon.
3. Stable settlement $/day below own 6-month average for two months → exit.
4. Accumulate only on: capture ≥ 25% for two months (growth trigger) or P/S ≤ 100× (valuation trigger).

## Evidence and reproducibility

- **BigQuery:** Three partition-filtered SQL queries for ft_events (stablecoin settlement), transactions (L1 usage), and contract ranking. Results committed to `src/data/`.
- **Archival RPC:** ft_metadata + ft_total_supply probe verified all nine contracts as 6-decimal USD.
- **Binance klines:** 682 daily closes for return, volatility, and lead-lag analysis.
- **CoinGecko + DefiLlama:** Market snapshot (price, cap, volume, TVL).
- **Intents Explorer API:** Not run (requires partner JWT). BigQuery ft_events used instead — it covers all token types, not only 1Click swaps.

Every verified number regenerates with one command: `./rebuild.sh`

## Sources

- https://docs.near.org/data-infrastructure/big-query
- https://docs.near-intents.org/near-intents/integration/distribution-channels/intents-explorer-api
- https://docs.coingecko.com/demo/reference/coins-id-market-chart
- https://api-docs.defillama.com/
