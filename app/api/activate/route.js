import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  const body = await request.json();
  const authHeader = request.headers.get("authorization");

  const secret = process.env.HUB_SECRET;
  const bearerOk = authHeader === `Bearer ${secret}`;
  const bodyOk = body.secret === secret;

  if (!bearerOk && !bodyOk) {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const { email, name, months } = body;
  if (!email) return Response.json({ success: false, error: "email required" }, { status: 400 });

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (months || 12));

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length === 0) {
    // User नहीं है → pre_activations में डालो
    await db.execute({
      sql: "INSERT INTO pre_activations (email) VALUES (?) ON CONFLICT(email) DO NOTHING",
      args: [email],
    });
  } else {
    // User है → activate करो
    await db.update(users).set({
      status: "active",
      expiryDate: expiry.toISOString(),
      reminderSent: 0,
    }).where(eq(users.email, email));
  }

  return Response.json({ success: true, ok: true, email, expiryDate: expiry.toISOString() });
}