import { db } from "@/db";
import { karigarWork, karigars } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });

  const rows = await db
    .select({
      id: karigarWork.id,
      karigarId: karigarWork.karigarId,
      description: karigarWork.description,
      metalType: karigarWork.metalType,
      issuedWeight: karigarWork.issuedWeight,
      returnedWeight: karigarWork.returnedWeight,
      wastageWeight: karigarWork.wastageWeight,
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

  if (!body.karigarId || !body.description || !body.issuedWeight) {
    return Response.json({ error: "सभी जानकारी जरूरी है" }, { status: 400 });
  }

  const inserted = await db
    .insert(karigarWork)
    .values({
      userId: session.userId,
      karigarId: parseInt(body.karigarId),
      description: body.description.trim(),
      metalType: body.metalType || "सोना",
      issuedWeight: parseFloat(body.issuedWeight),
    })
    .returning();

  return Response.json(inserted[0]);
}

export async function PUT(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const body = await request.json();
  if (!body.id || !body.returnedWeight) {
    return Response.json({ error: "id और वापस वजन जरूरी है" }, { status: 400 });
  }

  // Ownership check
  const existing = await db
    .select()
    .from(karigarWork)
    .where(and(eq(karigarWork.id, body.id), eq(karigarWork.userId, session.userId)))
    .limit(1);

  if (existing.length === 0) {
    return Response.json({ error: "नहीं मिला" }, { status: 404 });
  }

  const returnedWeight = parseFloat(body.returnedWeight);
  const issuedWeight = existing[0].issuedWeight;
  const wastageWeight = body.wastageWeight !== undefined
    ? parseFloat(body.wastageWeight)
    : Math.max(0, issuedWeight - returnedWeight);

  await db
    .update(karigarWork)
    .set({
      returnedWeight,
      wastageWeight,
      labourCharge: body.labourCharge ? parseFloat(body.labourCharge) : null,
      status: "done",
      returnedAt: new Date().toISOString(),
    })
    .where(eq(karigarWork.id, body.id));

  return Response.json({ ok: true });
}