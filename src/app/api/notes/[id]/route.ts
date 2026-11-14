import { db } from "@/db";
import { researchNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rejectCrossOrigin } from "@/lib/workspace";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Invalid note ID." }, { status: 400 });
  try {
    const [removed] = await db.delete(researchNotes).where(eq(researchNotes.id, id)).returning();
    if (!removed) return Response.json({ error: "Note not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "The note could not be deleted." }, { status: 500 }); }
}
