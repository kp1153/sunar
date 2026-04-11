import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const rows = await db.select().from(settings).where(eq(settings.userId, session.userId));
  return Response.json(rows[0] || {});
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const body = await request.json();
  const existing = await db.select().from(settings).where(eq(settings.userId, session.userId));
  if (existing.length === 0) {
    await db.insert(settings).values({
      userId: session.userId,
      shopName: body.shopName || null,
      ownerName: body.ownerName || null,
      phone: body.phone || null,
      address: body.address || null,
      gstin: body.gstin || null,
    });
  } else {
    await db.update(settings).set({
      shopName: body.shopName || null,
      ownerName: body.ownerName || null,
      phone: body.phone || null,
      address: body.address || null,
      gstin: body.gstin || null,
      updatedAt: new Date().toISOString(),
    }).where(eq(settings.userId, session.userId));
  }
  return Response.json({ ok: true });
}