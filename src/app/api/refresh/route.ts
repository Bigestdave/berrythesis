import { db } from "@/db";
import { marketSnapshots, researchRuns } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { fetchPublicSnapshot, rejectCrossOrigin } from "@/lib/workspace";

export const dynamic = "force-dynamic";
let refreshing = false;

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  if (refreshing) return Response.json({ error: "A refresh is already running. Please wait a moment." }, { status: 429 });
  try {
    const [latest] = db ? await db.select().from(researchRuns).where(eq(researchRuns.status, "success")).orderBy(desc(researchRuns.createdAt)).limit(1) : [];
    if (latest && Date.now() - latest.createdAt.getTime() < 30000) return Response.json({ error: "The sources were just refreshed. Please wait 30 seconds before re-running." }, { status: 429 });
    refreshing = true;
    const snapshot = await fetchPublicSnapshot();
    if (!db) {
      return Response.json({ snapshot, run: { id: "run-snapshot", status: "success", sourceCount: 2, detail: `Refreshed CoinGecko and DefiLlama: ${snapshot.history.prices.length} price observations and ${snapshot.tvl.length} TVL observations. On-chain sources were not run.`, createdAt: new Date().toISOString() } });
    }
    const run = await (db as any).transaction(async (tx: any) => {
      await tx.insert(marketSnapshots).values({ id: "near", data: snapshot }).onConflictDoUpdate({ target: marketSnapshots.id, set: { data: snapshot, updatedAt: new Date() } });
      const [run] = await tx.insert(researchRuns).values({ status: "success", sourceCount: 2, detail: `Refreshed CoinGecko and DefiLlama: ${snapshot.history.prices.length} price observations and ${snapshot.tvl.length} TVL observations. On-chain sources were not run.` }).returning();
      return run;
    });
    return Response.json({ snapshot, run: { ...run, createdAt: run.createdAt.toISOString() } });
  } catch (error) {
    const detail = error instanceof Error && error.message.includes("snapshot") ? error.message : "The data provider is unavailable. Your last verified snapshot is unchanged.";
    if (db) await db.insert(researchRuns).values({ status: "failed", sourceCount: 0, detail }).catch(() => {});
    return Response.json({ error: detail }, { status: 502 });
  } finally { refreshing = false; }
}
