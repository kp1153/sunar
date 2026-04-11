import { db } from "@/db";
import { girvi } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });
  const rows = await db.select().from(girvi).where(eq(girvi.userId, session.userId));
  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const body = await request.json();
  const inserted = await db.insert(girvi).values({
    userId: session.userId,
    customerName: body.customerName,
    customerPhone: body.customerPhone || null,
    itemDetails: body.itemDetails,
    loanAmount: parseInt(body.loanAmount),
    interestRate: parseFloat(body.interestRate),
  }).returning();
  return Response.json(inserted[0]);
}

export async function PUT(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const { id } = await request.json();
  await db.update(girvi).set({
    status: "closed",
    closeDate: new Date().toISOString(),
  }).where(eq(girvi.id, id));
  return Response.json({ ok: true });
}