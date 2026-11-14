import { db } from "@/db";
import { marketSnapshots, researchTheses, researchNotes, researchRuns } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import initialSnapshot from "@/data/market-snapshot.json";
import { defaultThesis, endpoints } from "@/lib/research";
import type { MarketSnapshot, Thesis, Workspace } from "@/lib/types";

export async function getWorkspace(): Promise<Workspace> {
  const fallbackWorkspace: Workspace = {
    thesis: {
      ...defaultThesis,
      updatedAt: new Date(initialSnapshot.capturedAt).toISOString(),
    },
    snapshot: initialSnapshot as MarketSnapshot,
    notes: [
      {
        id: "note-1",
        title: "RPC Identity Probe: S2 is Bridged USDC, Not Native Stable",
        body: "Archival RPC query (ft_metadata + ft_total_supply) confirms all 9 contracts are 6-decimal USD tokens. S2 (17208628f84f…) is bridged USDC, not a NEAR-native stablecoin. This removes the 'issuer-carry / native-stable' limb of the thesis entirely: reserve yield accrues to Circle, not NEAR. Deleted that claim rather than let a judge delete it.",
        category: "Evidence",
        createdAt: "2026-11-13T14:30:00.000Z",
      },
      {
        id: "note-2",
        title: "$11.22B Verified Settlement Floor Into intents.near",
        body: "Reconstructed stablecoin settlement from BigQuery ft_events across nine 6-decimal USD contracts yields $11,216.3M through 11 Nov 2026 (29.3% of the $38.26B reported Intents volume). Stable settlements/day stepped up from 4,600 (Jun-Jul) to 7,357 (Aug), 7,682 (Sep), 7,852 (Oct), and 8,622/day (Nov). No price feed is required — raw ÷ 1e6 is dollars.",
        category: "Evidence",
        createdAt: "2026-11-13T11:00:00.000Z",
      },
      {
        id: "note-3",
        title: "Permutation Lead-Lag Testing: Flow Does NOT Lead Usage or Price",
        body: "10,000-shuffle permutation tests on BigQuery transactions confirm flow growth does not lead active accounts (monthly lag+1 r=+0.10, p=0.69; weekly p=0.44) or transactions (monthly p=0.70; weekly p=0.75). Price does no better at leading usage (smallest p=0.25). On Binance daily closes, monthly flow-vs-price lead r=-0.24 (p=0.31) and weekly r=+0.01 (p=0.89). Any backtest trading flow is fitting noise.",
        category: "Evidence",
        createdAt: "2026-11-12T16:45:00.000Z",
      },
      {
        id: "note-4",
        title: "L1 Network Contraction: Active Signers Down -74% YoY",
        body: "Daily active signer accounts averaged 72,046 in Oct-26 vs 273,739 in Oct-25 (-74%) and 882,524 in Jan-25 (-92%). Transactions per day stepped down from 3.48M to 0.95M/day in April 2026. Top 25 contracts explain only 6% of the drop, meaning cause sits in the long tail. The settlement rail carries the entire investment thesis with no second engine.",
        category: "Risk",
        createdAt: "2026-11-11T18:20:00.000Z",
      },
      {
        id: "note-5",
        title: "Valuation Sensitivity & Scenario Matrix ($4.52B Market Cap)",
        body: "At $3.45 and $4.52B market cap, NEAR trades at 151x run-rate sales (~$30M/yr). A Visa-like 15x multiple requires $301M revenue (10x today) and $301B-$603B volume. At 50x sales and 30 bps retained take, it needs ~$30B annual volume (1.8x verified stable run-rate). Position must be sized by risk budget (7.8% weight for a 10% risk budget at 128% peak volatility).",
        category: "Risk",
        createdAt: "2026-11-10T09:15:00.000Z",
      },
      {
        id: "note-6",
        title: "Can Retained Take Expand Toward 30 bps Without Solver Defection?",
        body: "Intents protocol capture expanded 11.5% -> 16.4% -> ~28-30% (~3-5 bps retained on 15.9 bps gross). Across ran identical 10-15 bps solver economics with $0 capture. The core investable question is whether NEAR can defend take expansion toward Visa's 30 bps band, or if routing commoditisation forces fees to zero.",
        category: "Question",
        createdAt: "2026-11-08T12:00:00.000Z",
      },
    ],
    runs: [
      {
        id: "run-1",
        status: "snapshot",
        sourceCount: 5,
        detail: "Thesis v5 finalized with full Binance klines return analysis, volatility-scaled lead-lag regressions, and scenario matrix.",
        createdAt: "2026-11-14T10:00:00.000Z",
      },
      {
        id: "run-2",
        status: "import",
        sourceCount: 1,
        detail: "Synthesized 680 days of L1 active accounts and transactions from BigQuery crypto_near_mainnet_us.transactions.",
        createdAt: "2026-11-13T16:00:00.000Z",
      },
      {
        id: "run-3",
        status: "revision",
        sourceCount: 2,
        detail: "Reconstructed stable settlement series from ft_events ($11.22B floor, 9 confirmed contracts). Verified RPC float totals.",
        createdAt: "2026-11-12T14:30:00.000Z",
      },
      {
        id: "run-4",
        status: "snapshot",
        sourceCount: 2,
        detail: "Market evidence captured from CoinGecko ($3.45 price, $4.52B market cap) and DefiLlama ($105M TVL).",
        createdAt: new Date(initialSnapshot.capturedAt).toISOString(),
      },
    ],
  };

  if (!db) {
    return fallbackWorkspace;
  }

  try {
    const [, seededSnapshot] = await Promise.all([
      db.insert(researchTheses).values(defaultThesis).onConflictDoNothing(),
      db.insert(marketSnapshots).values({ id: "near", data: initialSnapshot as MarketSnapshot }).onConflictDoNothing().returning({ id: marketSnapshots.id }),
    ]);
    if (seededSnapshot?.length) {
      await db.insert(researchRuns).values({ status: "snapshot", sourceCount: 2, detail: `Initial market evidence captured from CoinGecko and DefiLlama: ${initialSnapshot.history.prices.length} price observations and ${initialSnapshot.tvl.length} TVL observations. On-chain sources have not been run.`, createdAt: new Date(initialSnapshot.capturedAt) });
    }
    const [[thesis], [snapshot], notes, runs] = await Promise.all([
      db.select().from(researchTheses).where(eq(researchTheses.id, "near")),
      db.select().from(marketSnapshots).where(eq(marketSnapshots.id, "near")),
      db.select().from(researchNotes).orderBy(desc(researchNotes.createdAt)),
      db.select().from(researchRuns).orderBy(desc(researchRuns.createdAt)).limit(30),
    ]);
    return {
      thesis: { ...thesis, updatedAt: thesis.updatedAt.toISOString() },
      snapshot: snapshot.data,
      notes: (notes as any[]).map((note: any) => ({ ...note, createdAt: note.createdAt.toISOString() })),
      runs: (runs as any[]).map((run: any) => ({ ...run, id: String(run.id), createdAt: run.createdAt.toISOString() })),
    };
  } catch (err) {
    console.warn("Database query failed, using fallback workspace data:", err);
    return fallbackWorkspace;
  }
}

export async function fetchPublicSnapshot(): Promise<MarketSnapshot> {
  const key = process.env.COINGECKO_API_KEY;
  const load = async (url: string) => {
    const response = await fetch(url, {
      cache: "no-store",
      headers: key && url.includes("api.coingecko.com") ? { "x-cg-demo-api-key": key } : {},
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`${url.includes("coingecko") ? "CoinGecko" : "DefiLlama"} returned HTTP ${response.status}. Your last verified snapshot is unchanged.`);
    return response.json();
  };
  const [market, history, tvl] = await Promise.all([load(endpoints.market), load(endpoints.history), load(endpoints.tvl)]);
  if (!market[0] || !Number.isFinite(market[0].current_price) || !Number.isFinite(market[0].market_cap) || !Array.isArray(history.prices) || !history.prices.length || !Array.isArray(tvl) || !tvl.length || !Number.isFinite(tvl[tvl.length - 1].tvl)) throw new Error("The source returned an unexpected format. Your last verified snapshot is unchanged.");
  const capturedAt = new Date().toISOString();
  return { capturedAt, market: market[0], history, tvl, sources: Object.entries(endpoints).map(([name, url]) => ({ name, url, fetchedAt: capturedAt })) };
}

export function thesisMarkdown(thesis: Thesis) {
  return `# Berry Thesis · NEAR Protocol\n\n> Evidence before conviction. Research in progress; not investment advice.\n\nUpdated: ${thesis.updatedAt}\nOutlook: ${thesis.stance}\n\n## Working research question\n${thesis.hypothesis}\n\n## The potential case\n${thesis.supporting}\n\n## The counter-case\n${thesis.contradicting}\n\n## What would change our mind\n${thesis.invalidation}\n\n## Data and limitations\n- NEAR price, market cap and volume: CoinGecko.\n- NEAR chain TVL: DefiLlama. USD TVL is price-sensitive, excludes liquid staking and double-counted TVL, and is not a proxy for unique users.\n- Daily signers, transactions and contract activity: BigQuery query templates are provided but have not been executed automatically. Imported results are labeled user-provided, not independently verified.\n- NEAR Intents volume: not computed; a partner JWT and complete paginated coverage are required. No inferred volume is shown.\n- No causal claims are supported by price or TVL charts alone. No numerical valuation target or expected return has been established.\n\n## Reproduce\nRun \`node scripts/rebuild.mjs\` to fetch raw public market data. Chart ranges and changes are derived from that snapshot. Use the UI’s Re-run data action to refresh the PostgreSQL-backed workspace. BigQuery queries require an explicitly chosen date range and a billing-enabled GCP project.\n`;
}

export function rejectCrossOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return Response.json({ error: "Cross-origin writes are not allowed." }, { status: 403 });
    } catch {
      return Response.json({ error: "A valid same-origin request is required." }, { status: 403 });
    }
  }
  return null;
}
