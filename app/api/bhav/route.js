import { db } from "@/db";
import { rates } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });

  const rows = await db
    .select()
    .from(rates)
    .where(eq(rates.userId, session.userId))
    .orderBy(desc(rates.updatedAt));

  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const body = await request.json();
  const { metal, purity, price } = body;

  if (!metal || !purity || !price) {
    return Response.json({ error: "सभी जानकारी जरूरी है" }, { status: 400 });
  }

  // UPSERT — same metal+purity का भाव update होगा, नई row नहीं बनेगी
  const existing = await db
    .select()
    .from(rates)
    .where(
      and(
        eq(rates.userId, session.userId),
        eq(rates.metal, metal),
        eq(rates.purity, purity)
      )
    )
    .limit(1);

  let result;
  if (existing.length > 0) {
    const updated = await db
      .update(rates)
      .set({
        price: parseFloat(price),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(rates.id, existing[0].id))
      .returning();
    result = updated[0];
  } else {
    const inserted = await db
      .insert(rates)
      .values({
        userId: session.userId,
        metal,
        purity,
        price: parseFloat(price),
      })
      .returning();
    result = inserted[0];
  }

  return Response.json(result);
}