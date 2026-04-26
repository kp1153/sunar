import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = await getSession(token);
  if (session) return NextResponse.json({ ok: true, email: session.email });
  return NextResponse.json({ ok: false });
}