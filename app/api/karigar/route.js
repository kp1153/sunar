import { db } from "@/db";
import { karigars } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json([], { status: 401 });
  const rows = await db.select().from(karigars).where(eq(karigars.userId, session.userId));
  return Response.json(rows);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });
  const body = await request.json();
  const inserted = await db.insert(karigars).values({
    userId: session.userId,
    name: body.name,
    phone: body.phone || null,
  }).returning();
  return Response.json(inserted[0]);
}