import { db } from "@/db";
import { stockItems } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

// बारकोड generate — SKU-userId-timestamp
function generateBarcode(userId) {
  const ts = Date.now().toString().slice(-8);
  return `SKU${userId}${ts}`;
}

export async function GET(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });

  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");

  if (barcode) {
    const rows = await db
      .select()
      .from(stockItems)
      .where(and(eq(stockItems.userId, session.userId), eq(stockItems.barcode, barcode)));
    return Response.json(rows[0] || null);
  }

  const all = await db
    .select()
    .from(stockItems)
    .where(eq(stockItems.userId, session.userId))
    .orderBy(desc(stockItems.createdAt));

  return Response.json(all);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const body = await request.json();
  const { name, metalType, purity, weight, makingCharge, hallmarkNo, huid } = body;

  if (!name || !metalType || !purity || !weight) {
    return Response.json({ error: "जरूरी जानकारी नहीं है" }, { status: 400 });
  }

  const barcode = generateBarcode(session.userId);

  await db.insert(stockItems).values({
    userId: session.userId,
    barcode,
    name,
    metalType,
    purity,
    weight: parseFloat(weight),
    makingCharge: makingCharge ? parseFloat(makingCharge) : 0,
    hallmarkNo: hallmarkNo || null,
    huid: huid || null,
    status: "available",
  });

  return Response.json({ ok: true, barcode });
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
    .delete(stockItems)
    .where(and(eq(stockItems.id, idNum), eq(stockItems.userId, session.userId)));

  return Response.json({ ok: true });
}