# Berry Thesis · NEAR Protocol

> Evidence before conviction. A working research document, not investment advice.

## Working question

Can NEAR turn network utility into long-term value?

The final investment argument is intentionally open. No price target, forecast return, or bullish/bearish conclusion has been validated.

## The potential case

NEAR’s chain abstraction and developer infrastructure offer a testable route toward broader adoption. The research should look for repeat usage, application diversity, and sustainable token demand—not merely high transaction counts. This is a research direction, not an established finding.

## The counter-case

Network usage does not automatically create value for the NEAR token. Subsidized transactions, concentrated application activity, low fees, and competition may weaken the case. Price and USD TVL can rise without organic user growth.

## What would change the argument

Revisit the thesis if repeat usage declines across two consecutive quarters, activity stays concentrated in subsidized applications, or network growth fails to generate measurable token demand. Finalize definitions and thresholds before evaluating the results.

## Evidence available in the application

- **CoinGecko:** timestamped NEAR spot price, market capitalization, 24-hour trading volume, and daily history. The initial real provider payload is in `src/data/market-snapshot.json`; later refreshes are retained in the workspace’s PostgreSQL snapshot.
- **DefiLlama:** historical NEAR-chain TVL. Liquid staking and double-counted TVL are excluded by the provider. USD TVL is price-sensitive and is not a measure of distinct users.
- **NEAR BigQuery:** three partition-filtered query templates are provided in `research/queries`. They have not been automatically executed. Query costs are billed to your Google Cloud project. Daily result imports are explicitly marked user-provided, not independently verified.
- **NEAR Intents:** aggregate volume is not computed. The Explorer API requires a partner JWT and complete, rate-limited pagination. Its coverage is historical 1Click swap transactions, not all network economic activity. No sample volume is represented as real data.

## Measurement limitations

- A transaction signer is an account, not a unique person.
- Submitted transaction counts are not successful transaction counts.
- Receipt function calls can include cross-contract activity; callers are not necessarily end users.
- Returning signers are observed within the chosen date window, not over their complete lifetime.
- Correlated price and TVL movements do not establish causality or token value accrual.
- Indexing series to 100 compares relative movement, not absolute scale. Missing TVL dates remain missing.
- The snapshot’s fetch timestamp differs from each provider’s observation timestamp.

## Reproduce

Run `node scripts/rebuild.mjs` from the project root to fetch and validate public market inputs. The charts are deterministic transformations of those raw observations. This produces the bundled snapshot used to initialize a fresh workspace; use **Re-run data** in the application to refresh its current database-backed snapshot.

Optional server environment variable: `COINGECKO_API_KEY` (CoinGecko Demo API key). Public access is used when no key is set; provider rate limits may apply. Source failures preserve the last successful database snapshot.

Use the date controls in the SQL dialog, inspect the full query, run it in a billing-enabled Google Cloud project, and import the real daily result JSON into On-chain analytics. Both dates must be explicit; the end date is exclusive.

Download **THESIS.md** inside the application for the current, editable version of this document. CSV exports contain chart observations. JSON evidence bundles include the raw market payload, queries, research notes, source references, imported results, and revision history.

## Sources

- https://docs.near.org/data-infrastructure/big-query
- https://docs.near-intents.org/near-intents/integration/distribution-channels/intents-explorer-api
- https://docs.coingecko.com/demo/reference/coins-id-market-chart
- https://api-docs.defillama.com/
