import { google } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("code_verifier")?.value;

  if (!code || state !== storedState) {
    return new Response("Invalid state", { status: 400 });
  }

  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const googleUser = await googleRes.json();

  let existing = await db.select().from(users).where(eq(users.email, googleUser.email));
  let user;

  if (existing.length === 0) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const inserted = await db.insert(users).values({
      email: googleUser.email,
      name: googleUser.name,
      status: "trial",
      expiryDate: expiry.toISOString(),
      reminderSent: 0,
    }).returning();
    user = inserted[0];
  } else {
    user = existing[0];
  }

  const token = await createSession(user.id, user.email, user.name, user.status, user.expiryDate);

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("session", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: true,
  });

  return response;
}