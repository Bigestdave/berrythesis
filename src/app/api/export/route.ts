import { getWorkspace, thesisMarkdown } from "@/lib/workspace";
import { queries } from "@/lib/research";
import { db } from "@/db";
import { onchainDatasets } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const workspace = await getWorkspace();
    const format = new URL(request.url).searchParams.get("format") ?? "md";
    if (format === "json") {
      const [onchain] = await db.select().from(onchainDatasets).where(eq(onchainDatasets.id, "near"));
      return new Response(JSON.stringify({ ...workspace, onchain: onchain?.data ?? null, queries, exportedAt: new Date().toISOString() }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="berry-thesis-research.json"' } });
    }
    if (format === "csv") {
      const snapshot = workspace.snapshot;
      const tvlByDate = new Map(snapshot.tvl.map(row => [new Date(row.date * 1000).toISOString().slice(0, 10), row.tvl]));
      const capsByTimestamp = new Map(snapshot.history.market_caps.map(([timestamp, value]) => [timestamp, value]));
      const volumesByTimestamp = new Map(snapshot.history.total_volumes.map(([timestamp, value]) => [timestamp, value]));
      const csv = ["timestamp_utc,near_price_usd,market_cap_usd,trading_volume_24h_usd,near_tvl_usd", ...snapshot.history.prices.map(([date, price]) => [new Date(date).toISOString(), price, capsByTimestamp.get(date) ?? "", volumesByTimestamp.get(date) ?? "", tvlByDate.get(new Date(date).toISOString().slice(0, 10)) ?? ""].join(","))].join("\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="near-market-data.csv"' } });
    }
    if (format !== "md") return Response.json({ error: "Choose md, csv, or json." }, { status: 400 });
    return new Response(thesisMarkdown(workspace.thesis), { headers: { "Content-Type": "text/markdown", "Content-Disposition": 'attachment; filename="THESIS.md"' } });
  } catch { return Response.json({ error: "The export could not be generated." }, { status: 500 }); }
}
