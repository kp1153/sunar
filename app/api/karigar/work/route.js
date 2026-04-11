import { db } from "@/db";
import { karigarWork, karigars } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });
  const rows = await db.select({
    id: karigarWork.id,
    karigarId: karigarWork.karigarId,
    description: karigarWork.description,
    metalType: karigarWork.metalType,
    issuedWeight: karigarWork.issuedWeight,
    returnedWeight: karigarWork.returnedWeight,
    labourCharge: karigarWork.labourCharge,
    status: karigarWork.status,
    issuedAt: karigarWork.issuedAt,
    returnedAt: karigarWork.returnedAt,
    karigarName: karigars.name,
  })
  .from(karigarWork)
  .leftJoin(karigars, eq(karigarWork.karigarId, karigars.id))
  .where(eq(karigarWork.userId, session.userId));
  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const body = await request.json();
  const inserted = await db.insert(karigarWork).values({
    userId: session.userId,
    karigarId: parseInt(body.karigarId),
    description: body.description,
    metalType: body.metalType,
    issuedWeight: parseFloat(body.issuedWeight),
  }).returning();
  return Response.json(inserted[0]);
}

export async function PUT(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const body = await request.json();
  await db.update(karigarWork).set({
    returnedWeight: parseFloat(body.returnedWeight),
    labourCharge: body.labourCharge ? parseFloat(body.labourCharge) : null,
    status: "done",
    returnedAt: new Date().toISOString(),
  }).where(eq(karigarWork.id, body.id));
  return Response.json({ ok: true });
}