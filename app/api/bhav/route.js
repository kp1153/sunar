import { db } from "@/db";
import { rates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });
  const rows = await db.select().from(rates).where(eq(rates.userId, session.userId)).orderBy(desc(rates.updatedAt));
  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const body = await request.json();
  const inserted = await db.insert(rates).values({
    userId: session.userId,
    metal: body.metal,
    purity: body.purity,
    price: parseFloat(body.price),
  }).returning();
  return Response.json(inserted[0]);
}