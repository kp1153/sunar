import { db } from "@/db";
import { urdPurchases } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });

  const rows = await db
    .select()
    .from(urdPurchases)
    .where(eq(urdPurchases.userId, session.userId))
    .orderBy(desc(urdPurchases.createdAt));

  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const body = await request.json();
  const {
    customerName,
    customerPhone,
    idProof,
    idNumber,
    metalType,
    purity,
    weight,
    ratePerTen,
    totalAmount,
    paymentMode,
    notes,
  } = body;

  if (!customerName || !metalType || !purity || !weight || !totalAmount) {
    return Response.json({ error: "जरूरी जानकारी नहीं है" }, { status: 400 });
  }

  await db.insert(urdPurchases).values({
    userId: session.userId,
    customerName,
    customerPhone: customerPhone || null,
    idProof: idProof || null,
    idNumber: idNumber || null,
    metalType,
    purity,
    weight: parseFloat(weight),
    ratePerTen: parseFloat(ratePerTen),
    totalAmount: parseFloat(totalAmount),
    paymentMode: paymentMode || "नकद",
    notes: notes || null,
  });

  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id जरूरी है" }, { status: 400 });

  const idNum = parseInt(id);
  if (!idNum) return Response.json({ error: "गलत id" }, { status: 400 });

  await db
    .delete(urdPurchases)
    .where(and(eq(urdPurchases.id, idNum), eq(urdPurchases.userId, session.userId)));

  return Response.json({ ok: true });
}