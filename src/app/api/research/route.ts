import { db } from "@/db";
import { researchTheses, researchRuns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspace, rejectCrossOrigin } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json(await getWorkspace()); }
  catch { return Response.json({ error: "The research workspace could not be loaded." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const fields = ["hypothesis", "supporting", "contradicting", "invalidation"] as const;
    if (!db) {
      return Response.json({ id: "near", hypothesis: body.hypothesis.trim(), supporting: body.supporting.trim(), contradicting: body.contradicting.trim(), invalidation: body.invalidation.trim(), stance: body.stance, updatedAt: new Date().toISOString() });
    }
    const [updated] = await (db as any).transaction(async (tx: any) => {
      const rows = await tx.update(researchTheses).set({ hypothesis: body.hypothesis.trim(), supporting: body.supporting.trim(), contradicting: body.contradicting.trim(), invalidation: body.invalidation.trim(), stance: body.stance, updatedAt: new Date() }).where(eq(researchTheses.id, "near")).returning();
      await tx.insert(researchRuns).values({ status: "revision", sourceCount: 0, detail: "Investment thesis updated. Working question, counter-case, and invalidation conditions saved." });
      return rows;
    });
    if (!updated) return Response.json({ error: "Open the workspace before editing." }, { status: 404 });
    return Response.json({ ...updated, updatedAt: updated.updatedAt.toISOString() });
  } catch { return Response.json({ error: "Unable to save the thesis. Please try again." }, { status: 500 }); }
}
