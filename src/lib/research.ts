export const defaultThesis = {
  id: "near",
  hypothesis: "NEAR is short its own take rate: can retained take on the $11.22B+ Intents rail re-rate from cyclical crypto fees to recurring, asset-light settlement revenue?",
  supporting: "• $11.22B verified stablecoin settlement floor into intents.near across nine confirmed 6-decimal USD contracts (29.3% of the $38.26B NEAR reports).\n• Price-free rail activity: stable settlements per day stepped up from 4,600 (Jun-Jul 26) to 7,357 (Aug), 7,682 (Sep), 7,852 (Oct) and 8,622/day (Nov 1-11).\n• Growing share of L1 activity: intents.near received 32,765 txs/day in Mar-26 and 64,962 in Oct-26 (122,954 in Nov 1-11), rising from 0.9% to 8.9% to 17.0% of all L1 transactions. Median caller count: 147/day (solvers and relayers, not end users).\n• Protocol capture climbing: retained take expanded 11.5% → 16.4% → ~28–30% (retained take ~3–5 bps on ~15.9 bps gross fees; cumulative net revenue ~$11.7M on ~$61M gross).\n• Historical comparables (Visa/Mastercard 30 bps on zero credit risk, LSEG data re-rating, ICE clearing, AWS SOTP) show markets pay the highest multiples for recurring, asset-light tolls without credit risk.",
  contradicting: "• Flow does not lead network usage (permutation p = 0.44 to 0.75) or token price (monthly lead r = -0.24, p=0.31; weekly +0.01, p=0.89). Price does no better at leading usage (smallest p = 0.25). No timing trade exists.\n• The L1 is shrinking: daily active accounts down -74% YoY (72k Oct-26 vs 273k Oct-25, -92% vs Jan-25 882k). Txns stepped down from 3.48M to 0.95M/day in Apr-26.\n• Returns are concentrated and volatile: +251% since fee switch at 108% annualised volatility (Sharpe 1.62), but one month (Sep 2026) supplies 81% of the gain and Sharpe without it is 0.36. Max drawdown -43.6%, currently -41.6% from the high close. Over the whole file NEAR is -35% with an 84% peak-to-trough fall.\n• Moat is unproven: intent routing is commoditised (Across ran 10-15 bps with $0 capture). NEAR has Visa's take rate, not Visa's defensibility.\n• Valuation needs a lot to be true: at 151× run-rate sales ($4.52B), a 15× multiple needs $301M revenue (10× today) and $301B-$603B volume. At 50× and 30 bps it needs ~$30B (1.8× verified stable run-rate).\n• Weak supply discipline: buybacks offset <25% of issuance and purchased NEAR is held in multisig, not burned.",
  invalidation: "1. Net revenue (not volume) fails to grow ≥ 50% over four quarters (kills thesis).\n2. Protocol capture falls below 15% for two consecutive months: abandon.\n3. Stable settlement $/day below own 6-month average for two consecutive months: exit.\n4. Valuation trigger: P/S ≤ 100x (≤ $2.29 at today's revenue, or ≥ $45M/yr revenue) before accumulating.\n5. Growth trigger: capture ≥ 25% for two months AND stable $/day at 3-month high.",
  stance: "Under review / Take-rate expansion option",
};

export const queries = [
  {
    id: "inflow",
    title: "Stablecoin settlement into intents.near",
    file: "01_stable_inflow_daily_by_contract.sql",
    description: "Daily inbound fungible-token flow into intents.near per token contract. Classifies each contract via ft_metadata RPC and sums verified 6-decimal USD stablecoins.",
    table: "ft_events",
    sql: `-- Daily inbound fungible-token flow into intents.near, per token contract.
-- Stablecoin settlement is NOT hard-coded here: classifies each contract via
-- ft_metadata (RPC) and keeps only verified 6-decimal USD stablecoins.
-- Cost: scans ft_events for the block_date window only.
SELECT block_date,
       contract_account_id,
       COUNT(*)                                   AS inbound_events,
       SUM(SAFE_CAST(delta_amount AS BIGNUMERIC)) AS raw_amount
FROM \`bigquery-public-data.crypto_near_mainnet_us.ft_events\`
WHERE block_date BETWEEN @start_date AND @end_date
  AND affected_account_id = 'intents.near'
  AND SAFE_CAST(delta_amount AS BIGNUMERIC) > 0
GROUP BY block_date, contract_account_id
ORDER BY block_date, raw_amount DESC;`,
  },
  {
    id: "activity",
    title: "L1 active accounts & transactions",
    file: "02_daily_active_accounts_and_txs.sql",
    description: "First-party L1 usage: daily active signer accounts and transaction counts. Measures L1 network trajectory over time.",
    table: "transactions",
    sql: `-- First-party L1 usage: daily active signer accounts and transaction counts.
SELECT block_date,
       COUNT(DISTINCT signer_account_id) AS daily_active_accounts,
       COUNT(*)                          AS tx_count
FROM \`bigquery-public-data.crypto_near_mainnet_us.transactions\`
WHERE block_date BETWEEN @start_date AND @end_date
GROUP BY block_date
ORDER BY block_date;`,
  },
  {
    id: "contracts",
    title: "Contract usage & receiver ranking",
    file: "03_daily_contract_usage.sql",
    description: "Daily tx count and distinct callers for the 25 most-called receiver accounts. Measures Intents share of L1 activity vs other contracts.",
    table: "transactions",
    sql: `-- Contract usage: daily tx count and distinct callers for the 25 most-called receiver accounts.
WITH top AS (
  SELECT receiver_account_id
  FROM \`bigquery-public-data.crypto_near_mainnet_us.transactions\`
  WHERE block_date BETWEEN @start_date AND @end_date
  GROUP BY receiver_account_id
  ORDER BY COUNT(*) DESC
  LIMIT 25
)
SELECT t.block_date,
       t.receiver_account_id,
       COUNT(*)                            AS tx_count,
       COUNT(DISTINCT t.signer_account_id) AS distinct_callers
FROM \`bigquery-public-data.crypto_near_mainnet_us.transactions\` t
JOIN top USING (receiver_account_id)
WHERE t.block_date BETWEEN @start_date AND @end_date
GROUP BY t.block_date, t.receiver_account_id
ORDER BY t.block_date, tx_count DESC;`,
  },
];

export const confirmedContracts = [
  { leg: "S1", contract: "usdt.tether-token.near", symbol: "USDt", decimals: 6, float: "$525.9M", status: "Verified", note: "Primary native Tether issuance on NEAR" },
  { leg: "S2", contract: "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1", symbol: "USDC", decimals: 6, float: "$78.6M", status: "Verified", note: "Bridged USDC (not native stable; reserve carry accrues to Circle)" },
  { leg: "S3", contract: "eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near", symbol: "USDT", decimals: 6, float: "$13.0M", status: "Verified", note: "Ethereum OMFT bridged Tether" },
  { leg: "S4", contract: "eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near", symbol: "USDC", decimals: 6, float: "$26.0M", status: "Verified", note: "Ethereum OMFT bridged USDC" },
  { leg: "S5", contract: "base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near", symbol: "USDC", decimals: 6, float: "$1.7M", status: "Verified", note: "Base OMFT bridged USDC" },
  { leg: "S6", contract: "arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near", symbol: "USDC", decimals: 6, float: "$3.0M", status: "Verified", note: "Arbitrum OMFT bridged USDC" },
  { leg: "S7", contract: "arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near", symbol: "USDT", decimals: 6, float: "$0.5M", status: "Verified", note: "Arbitrum OMFT bridged USDT" },
  { leg: "S8", contract: "tron-d28a265909efecdcee7c5028585214ea0b96f015.omft.near", symbol: "USDT", decimals: 6, float: "$7.8M", status: "Verified", note: "Tron OMFT bridged USDT" },
  { leg: "S9", contract: "plasma-0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb.omft.near", symbol: "USDT", decimals: 6, float: "$0.1M", status: "Verified", note: "Plasma OMFT bridged USDT" },
];

export const monthlySettlement = [
  { month: "2025-01", settled: "$1.6M", perDay: "$0.05M/day", eventsPerDay: "~120", phase: "Early ramp" },
  { month: "2025-06", settled: "$19.0M", perDay: "$0.63M/day", eventsPerDay: "~680", phase: "Early ramp" },
  { month: "2025-09", settled: "$124.1M", perDay: "$4.14M/day", eventsPerDay: "~1,850", phase: "Inflection" },
  { month: "2025-11", settled: "$864.5M", perDay: "$28.82M/day", eventsPerDay: "~3,400", phase: "Step 1 plateau" },
  { month: "2026-01", settled: "$761.4M", perDay: "$24.56M/day", eventsPerDay: "~3,600", phase: "Step 1 plateau" },
  { month: "2026-06", settled: "$825.0M", perDay: "$27.50M/day", eventsPerDay: "4,600", phase: "Step 1 plateau" },
  { month: "2026-08", settled: "$960.4M", perDay: "$30.98M/day", eventsPerDay: "7,357", phase: "Step 2 inflection" },
  { month: "2026-09", settled: "$1,464.1M", perDay: "$48.80M/day", eventsPerDay: "7,682", phase: "Step 2 plateau" },
  { month: "2026-10", settled: "$1,239.6M", perDay: "$39.99M/day", eventsPerDay: "7,852", phase: "Step 2 plateau" },
  { month: "2026-11 (11d)", settled: "$533.5M", perDay: "$48.50M/day", eventsPerDay: "8,622", phase: "Step 2 plateau" },
];

export const comparables = [
  {
    name: "Visa / Mastercard",
    mechanism: "~30× compound over ~17 yrs on ~30 bps net take with ZERO credit risk — banks hold the balances.",
    mapping: "NEAR Intents earns 15.9 bps gross — half of Visa's net take — and carries no balances; solvers do. Same asset-light, principal-risk-free shape.",
    status: "Analogue",
  },
  {
    name: "LSEG (London Stock Exchange)",
    mechanism: "Transaction-fee exchange rebuilt into recurring data company; market pays higher multiple for recurring revenue than transaction volume.",
    mapping: "Cleanest capture-quality case: same throughput revalued because revenue type changed. Explains why flow ≠ price null result is consistent with infra re-rating.",
    status: "Analogue",
  },
  {
    name: "ICE (Intercontinental Exchange)",
    mechanism: "Grew from trading venue into clearing + fixed-income + data; re-rated on record ~$1.4B/quarter recurring income.",
    mapping: "Routing venue stacking higher-quality captured layers on existing flow. NEAR has not yet proven an equivalent captured layer.",
    status: "Catalyst",
  },
  {
    name: "AWS inside Amazon",
    mechanism: "Priced at ~zero for years; SOTP work argued AWS alone was worth more than entire company.",
    mapping: "Valuation method: value declining L1 and the settlement rail separately. Market currently prices rail at zero.",
    status: "Valuation",
  },
  {
    name: "Etsy Discipline",
    mechanism: "Raising capture on a flat or shrinking base with no compounding layer de-rated the stock.",
    mapping: "Discipline against over-claiming: take-rate expansion is necessary but not sufficient. Infra multiple is the prize if defensibility is proven.",
    status: "Discipline",
  },
];

export const falsifiers = [
  { id: 1, signal: "Protocol capture (DeFiLlama rev ÷ fees)", threshold: "< 15% for 2 consecutive months", action: "Abandon — the rung-2 take expansion stopped" },
  { id: 2, signal: "Stable settlement $/day", threshold: "Below own 6-month average for 2 consecutive months", action: "Downgrade — rail demand failing" },
  { id: 3, signal: "Intents monthly volume", threshold: "< $2B for a quarter", action: "Downgrade" },
  { id: 4, signal: "Revenue-quality / recurrence trigger", threshold: "Capture ≥ 25% AND stable $/day at 3-mo high, 2 months running", action: "Upgrade — behaving like recurring infra revenue" },
  { id: 5, signal: "Buyback wallets", threshold: "Net sellers", action: "Delete the supply-side appendix entirely" },
  { id: 6, signal: "Retained take rate", threshold: "Sustained > 10 bps", action: "Upgrade — rung-2 convergence is real, not episodic" },
];

export const leadLagTests = [
  { test: "Monthly, active accounts (n=20)", lagPlus1: "+0.10 (p=0.69)", lag0: "-0.09 (p=0.69)", lagMinus1: "+0.15 (p=0.53)", verdict: "Null holds" },
  { test: "Monthly, transactions (n=20)", lagPlus1: "+0.09 (p=0.70)", lag0: "+0.15 (p=0.53)", lagMinus1: "+0.20 (p=0.40)", verdict: "Null holds" },
  { test: "Weekly, active accounts (n=94)", lagPlus1: "+0.08 (p=0.44)", lag0: "-0.04 (p=0.69)", lagMinus1: "+0.03 (p=0.71)", verdict: "Null holds" },
  { test: "Weekly, transactions (n=94)", lagPlus1: "+0.03 (p=0.75)", lag0: "+0.18 (p=0.09)", lagMinus1: "-0.10 (p=0.29)", verdict: "Null holds" },
  { test: "Price leading usage (accounts & txs)", lagPlus1: "smallest p=0.25", lag0: "n/a", lagMinus1: "n/a", verdict: "Null holds (price no better)" },
  { test: "Flow vs NEAR price (All months, n=21)", lagPlus1: "-0.24 (p=0.31)", lag0: "-0.10 (p=0.68)", lagMinus1: "-0.02 (p=0.95)", verdict: "Null holds" },
  { test: "Flow vs price, vol-scaled (n=15)", lagPlus1: "-0.24 (p=0.40)", lag0: "-0.30 (p=0.28)", lagMinus1: "+0.03 (p=0.92)", verdict: "Null holds" },
  { test: "Flow vs NEAR price (2026 only, n=10)", lagPlus1: "-0.01 (p=0.98)", lag0: "+0.09 (p=0.82)", lagMinus1: "+0.11 (p=0.78)", verdict: "Null holds" },
  { test: "Flow vs price (Weekly, n=95)", lagPlus1: "+0.01 (p=0.89)", lag0: "-0.06 (p=0.58)", lagMinus1: "-0.04 (p=0.69)", verdict: "Null holds" },
  { test: "Flow vs price, weekly vol-scaled (n=87)", lagPlus1: "-0.01 (p=0.93)", lag0: "-0.02 (p=0.89)", lagMinus1: "+0.02 (p=0.86)", verdict: "Null holds" },
];

export const returnsComparison = [
  { metric: "Price window", sinceFeeSwitch: "$0.981 → $3.445", wholeFile: "$5.286 → $3.445", note: "Fee switch: 23 Feb 2026; Whole file: 1 Jan 2025" },
  { metric: "Total return", sinceFeeSwitch: "+251%", wholeFile: "-35%", note: "Log returns, risk-free rate 0" },
  { metric: "Annualised volatility", sinceFeeSwitch: "108%", wholeFile: "102%", note: "Last 30 days: 98%; Last 90 days: 128%" },
  { metric: "Sharpe / Sortino", sinceFeeSwitch: "1.62 / 2.59", wholeFile: "-0.22 / -0.32", note: "365-day basis" },
  { metric: "Maximum drawdown", sinceFeeSwitch: "-43.6%", wholeFile: "-84.0%", note: "Trough: 18 Aug 26 (-43.6%); 11 Feb 26 (-84%)" },
  { metric: "Current drawdown from high close", sinceFeeSwitch: "-41.6%", wholeFile: "-42.7%", note: "High close: $5.896 on 11 Oct 2026" },
  { metric: "Return ÷ maximum drawdown", sinceFeeSwitch: "5.8×", wholeFile: "n/a", note: "Reward to peak pain ratio" },
  { metric: "Best month (Sep 2026)", sinceFeeSwitch: "+177.9% (81% of gain)", wholeFile: "+177.9% (5.3σ outlier)", note: "Single rare event drives bulk of performance" },
  { metric: "Sharpe without Sep-2026", sinceFeeSwitch: "0.36", wholeFile: "-0.82", note: "Removing 1 event collapses risk-adjusted return" },
];

export const riskBudgeting = [
  { budget: "5% annual risk budget", weight: "3.9%", formula: "5% ÷ 128% peak realized volatility" },
  { budget: "10% annual risk budget", weight: "7.8%", formula: "10% ÷ 128% peak realized volatility" },
  { budget: "15% annual risk budget", weight: "11.7%", formula: "15% ÷ 128% peak realized volatility" },
];

export const scenarioMatrix = [
  {
    multiple: "15× sales (Visa mature)",
    revNeeded: "$301M (10× today)",
    take5bps: "$603B/yr (36.7× verified stable)",
    take10bps: "$301B/yr (18.4× verified stable)",
    take30bps: "$100B/yr (6.1× verified stable)",
  },
  {
    multiple: "30× sales (High growth)",
    revNeeded: "$151M (5× today)",
    take5bps: "$301B/yr (18.4× verified stable)",
    take10bps: "$151B/yr (9.2× verified stable)",
    take30bps: "$50B/yr (3.1× verified stable)",
  },
  {
    multiple: "50× sales (Infra premium)",
    revNeeded: "$90M (3× today)",
    take5bps: "$181B/yr (11.0× verified stable)",
    take10bps: "$90B/yr (5.5× verified stable)",
    take30bps: "$30B/yr (1.8× verified stable)",
  },
];

export const honestyLedger = [
  { claim: "$11.22B cumulative stable settlement (nine contracts)", status: "Verified", basis: "Recomputed from ft_events; matches earlier panel to the digit" },
  { claim: "29.3% of reported volume", status: "Verified / Reported", basis: "$11.22B verified floor ÷ $38.26B reported dashboard figure" },
  { claim: "All nine contracts are confirmed 6-dec USD", status: "Verified", basis: "ft_metadata RPC probe on archival node" },
  { claim: "S2 is USDC, not a native stablecoin", status: "Verified", basis: "ft_metadata RPC probe; reserve yield accrues to Circle" },
  { claim: "Stable settlements/day: 7,357 (Aug) → 8,622 (Nov)", status: "Verified", basis: "Event counts, nine 6-decimal USD contracts" },
  { claim: "Flow does not lead network usage or price", status: "Verified", basis: "Permutation tests (10k shuffles) on BigQuery transactions & Binance klines" },
  { claim: "L1 active accounts down -74% YoY", status: "Verified", basis: "BigQuery transactions signer_account_id (72k Oct-26 vs 273k Oct-25)" },
  { claim: "Intents share of L1 txs: 0.9% → 8.9% → 17.0%", status: "Verified", basis: "BigQuery transactions receiver_account_id; median 147 callers/day" },
  { claim: "15.9 bps gross / ~3–5 bps retained take", status: "Reported", basis: "DeFiLlama + NEAR dashboard; blended floor" },
  { claim: "Protocol capture: 11.5% → 16.4% → ~28–30%", status: "Reported", basis: "Dashboard / Nansen" },
  { claim: "Buybacks < 25% of issuance, held not burned", status: "Reported", basis: "NEAR public revenue dashboard + multisig tracking" },
  { claim: "Visa / LSEG / ICE / AWS comparables", status: "Reported", basis: "External SEC filings / annual reports; context anchors" },
];

export const sourceLinks = {
  bigquery: "https://console.cloud.google.com/bigquery?p=bigquery-public-data&d=crypto_near_mainnet_us&page=dataset",
  nearDocs: "https://docs.near.org/data-infrastructure/big-query",
  intents: "https://docs.near-intents.org/near-intents/integration/distribution-channels/intents-explorer-api",
  intentsExplorer: "https://explorer.near-intents.org/",
  coingecko: "https://www.coingecko.com/en/coins/near",
  defillama: "https://defillama.com/chain/near",
};

export const endpoints = {
  market: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=near&sparkline=false",
  history: "https://api.coingecko.com/api/v3/coins/near/market_chart?vs_currency=usd&days=365&interval=daily",
  tvl: "https://api.llama.fi/v2/historicalChainTvl/Near",
};

export function compact(value: number, currency = true) {
  const prefix = currency ? "$" : "";
  if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${prefix}${(value / 1e3).toFixed(1)}K`;
  return `${prefix}${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function percent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatDate(date: string | number, time = false) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) });
}
