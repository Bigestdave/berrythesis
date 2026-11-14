import { db } from "@/db";
import { onchainDatasets, researchRuns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rejectCrossOrigin } from "@/lib/workspace";
import type { OnchainRow } from "@/lib/types";

import fallbackDataset from "@/data/onchain-dataset.json";

export async function GET() {
  if (!db) return Response.json(fallbackDataset);
  try {
    const [result] = await db.select().from(onchainDatasets).where(eq(onchainDatasets.id, "near"));
    return Response.json(result?.data ?? fallbackDataset);
  } catch { return Response.json(fallbackDataset); }
}

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const text = await request.text();
    if (text.length > 2000000) return Response.json({ error: "The import must be smaller than 2 MB." }, { status: 413 });
    const body = JSON.parse(text);
    if (!Array.isArray(body.rows) || !body.rows.length || body.rows.length > 10000 || typeof body.source !== "string" || !body.source.trim() || body.source.length > 1000) return Response.json({ error: "Provide 1–10,000 daily rows and a source or query reference." }, { status: 400 });
    const seen = new Set<string>();
    for (const row of body.rows) {
      if (typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(Date.parse(row.date)) || new Date(row.date).toISOString().slice(0, 10) !== row.date || seen.has(row.date) || !Number.isSafeInteger(row.active_accounts) || row.active_accounts < 0 || !Number.isSafeInteger(row.transactions) || row.transactions < row.active_accounts || (row.active_contracts !== undefined && (!Number.isSafeInteger(row.active_contracts) || row.active_contracts < 0))) return Response.json({ error: "Rows need unique valid YYYY-MM-DD dates, nonnegative integer counts, and transactions ≥ active_accounts." }, { status: 400 });
      seen.add(row.date);
    }
    const rows: OnchainRow[] = body.rows.map((r: OnchainRow) => ({ date: r.date, active_accounts: r.active_accounts, transactions: r.transactions, ...(r.active_contracts !== undefined ? { active_contracts: r.active_contracts } : {}) })).sort((a: OnchainRow, b: OnchainRow) => a.date.localeCompare(b.date));
    const data = { rows, source: body.source.trim(), importedAt: new Date().toISOString() };
    if (!db) return Response.json(data, { status: 201 });
    await db.transaction(async (tx: any) => {
      await tx.insert(onchainDatasets).values({ id: "near", data }).onConflictDoUpdate({ target: onchainDatasets.id, set: { data, updatedAt: new Date() } });
      await tx.insert(researchRuns).values({ status: "import", sourceCount: 1, detail: `Imported ${rows.length} daily on-chain observations. User-provided results; not independently verified.` });
    });
    return Response.json(data, { status: 201 });
  } catch { return Response.json({ error: "Could not import the results. Check your JSON and try again." }, { status: 400 }); }
}
