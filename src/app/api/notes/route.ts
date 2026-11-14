import { db } from "@/db";
import { researchNotes } from "@/db/schema";
import { desc } from "drizzle-orm";
import { rejectCrossOrigin } from "@/lib/workspace";

export async function GET() {
  const notes = await db.select().from(researchNotes).orderBy(desc(researchNotes.createdAt));
  return Response.json(notes);
}

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const { title, body, category } = await request.json();
    if (typeof title !== "string" || !title.trim() || title.length > 180 || typeof body !== "string" || !body.trim() || body.length > 20000 || !["Observation", "Question", "Evidence", "Risk"].includes(category)) return Response.json({ error: "Add a title, a note, and a valid category." }, { status: 400 });
    const [note] = await db.insert(researchNotes).values({ title: title.trim(), body: body.trim(), category }).returning();
    return Response.json(note, { status: 201 });
  } catch { return Response.json({ error: "Your note could not be saved. Please try again." }, { status: 500 }); }
}
