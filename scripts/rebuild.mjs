import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const urls = {
  market: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=near&sparkline=false",
  history: "https://api.coingecko.com/api/v3/coins/near/market_chart?vs_currency=usd&days=365&interval=daily",
  tvl: "https://api.llama.fi/v2/historicalChainTvl/Near",
};
const capturedAt = new Date().toISOString();
const headers = process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {};
async function load(url) {
  const response = await fetch(url, { headers: url.includes("coingecko") ? headers : {}, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${new URL(url).hostname}: HTTP ${response.status}. Existing snapshot was not replaced.`);
  return response.json();
}
try {
  const [market, history, tvl] = await Promise.all(Object.values(urls).map(load));
  if (!market[0] || !Number.isFinite(market[0].current_price) || !history.prices?.length || !Array.isArray(tvl) || !tvl.length) throw new Error("Unexpected data format. Existing snapshot was not replaced.");
  const snapshot = {
    capturedAt,
    market: market[0],
    history,
    tvl,
    sources: Object.entries(urls).map(([name, url]) => ({ name, url, fetchedAt: capturedAt })),
  };
  await mkdir(path.join(root, "src/data"), { recursive: true });
  await writeFile(path.join(root, "src/data/market-snapshot.json"), JSON.stringify(snapshot));
  console.log(`Rebuilt the raw market snapshot at ${capturedAt}.`);
  console.log(`${history.prices.length} price observations; ${tvl.length} TVL observations. All chart ranges are derived directly from this snapshot.`);
  console.log("Sources: CoinGecko and DefiLlama. On-chain queries require a separately billed BigQuery project; Intents requires a partner JWT. Neither is simulated.");
  console.log("The UI’s Re-run data button independently refreshes its PostgreSQL snapshot. To use this file in a fresh database, rebuild and restart the app.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
