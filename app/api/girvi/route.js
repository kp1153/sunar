import { db } from "@/db";
import { girvi } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });

  const rows = await db
    .select()
    .from(girvi)
    .where(eq(girvi.userId, session.userId))
    .orderBy(girvi.entryDate);

  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const body = await request.json();

  if (!body.customerName || !body.itemDetails || !body.loanAmount) {
    return Response.json({ error: "नाम, गहना और रकम जरूरी है" }, { status: 400 });
  }

  const inserted = await db
    .insert(girvi)
    .values({
      userId: session.userId,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone?.trim() || null,
      itemDetails: body.itemDetails.trim(),
      weightGrams: body.weightGrams ? parseFloat(body.weightGrams) : null,
      loanAmount: parseInt(body.loanAmount),
      interestRate: parseFloat(body.interestRate) || 1.5,
    })
    .returning();

  return Response.json(inserted[0]);
}

export async function PUT(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const body = await request.json();

  if (!body.id) return Response.json({ error: "id जरूरी है" }, { status: 400 });

  // ownership check — दूसरे user की girvi न बदल सके
  const existing = await db
    .select()
    .from(girvi)
    .where(and(eq(girvi.id, body.id), eq(girvi.userId, session.userId)))
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: "नहीं मिली" }, { status: 404 });
  }

  await db
    .update(girvi)
    .set({
      status: "closed",
      closeDate: new Date().toISOString(),
    })
    .where(eq(girvi.id, body.id));

  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return Response.json({ error: "id जरूरी है" }, { status: 400 });

  // ownership check
  const existing = await db
    .select()
    .from(girvi)
    .where(and(eq(girvi.id, parseInt(id)), eq(girvi.userId, session.userId)))
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: "नहीं मिली" }, { status: 404 });
  }

  await db.delete(girvi).where(eq(girvi.id, parseInt(id)));

  return Response.json({ ok: true });
}