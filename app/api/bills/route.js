import { db } from "@/db";
import { bills } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

// Bill number generate करना — BILL-YYYYMMDD-XXX format
function generateBillNumber(existingCount) {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const seq = String(existingCount + 1).padStart(3, "0");
  return `BILL-${dateStr}-${seq}`;
}

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });

  const rows = await db
    .select()
    .from(bills)
    .where(eq(bills.userId, session.userId))
    .orderBy(desc(bills.createdAt));

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
    item,
    metalType,
    purity,
    grossWeight,
    netWeight,
    ratePerTen,
    metalValue,
    makingCharge,
    gst,
    totalAmount,
    paymentMode,
  } = body;

  if (!customerName || !item || !netWeight || !totalAmount) {
    return Response.json({ error: "जरूरी जानकारी नहीं है" }, { status: 400 });
  }

  // आज के बिलों की count लो ताकि bill number बन सके
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const allBills = await db
    .select()
    .from(bills)
    .where(eq(bills.userId, session.userId));

  const billNumber = generateBillNumber(allBills.length);

  const inserted = await db
    .insert(bills)
    .values({
      userId: session.userId,
      billNumber,
      customerName,
      customerPhone: customerPhone || null,
      item,
      metalType,
      purity,
      grossWeight: grossWeight ? parseFloat(grossWeight) : null,
      netWeight: parseFloat(netWeight),
      ratePerTen: parseFloat(ratePerTen),
      metalValue: parseFloat(metalValue),
      makingCharge: makingCharge ? parseFloat(makingCharge) : 0,
      gst: parseFloat(gst),
      totalAmount: parseFloat(totalAmount),
      paymentMode: paymentMode || "नकद",
    })
    .returning();

  return Response.json(inserted[0]);
}

export async function DELETE(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return Response.json({ error: "id जरूरी है" }, { status: 400 });

  await db
    .delete(bills)
    .where(eq(bills.id, parseInt(id)));

  return Response.json({ ok: true });
}