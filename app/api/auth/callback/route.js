import { google } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";
const TRIAL_DAYS = 7;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("code_verifier")?.value;

  if (!code || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const googleUser = await googleRes.json();

    const email = googleUser.email;
    const name = googleUser.name;

    // --- Developer shortcut ---
    if (email === DEVELOPER_EMAIL) {
      const token = await createSession(0, email, name, "active", null);
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

    // --- users table check ---
    let existing = await db.select().from(users).where(eq(users.email, email));
    let user;

    if (existing.length === 0) {
      // नया user → trial INSERT
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + TRIAL_DAYS);

      const inserted = await db.insert(users).values({
        email,
        name,
        status: "trial",
        expiryDate: expiry.toISOString(),
        reminderSent: 0,
      }).returning();
      user = inserted[0];

      // pre_activations check → payment पहले हुई थी?
      const preAct = await db.execute({
        sql: "SELECT * FROM pre_activations WHERE email = ? LIMIT 1",
        args: [email],
      });

      if (preAct.rows.length > 0) {
        const activeExpiry = new Date();
        activeExpiry.setFullYear(activeExpiry.getFullYear() + 1);

        await db.update(users).set({
          status: "active",
          expiryDate: activeExpiry.toISOString(),
          reminderSent: 0,
        }).where(eq(users.email, email));

        await db.execute({
          sql: "DELETE FROM pre_activations WHERE email = ?",
          args: [email],
        });

        user = { ...user, status: "active", expiryDate: activeExpiry.toISOString() };
      }
    } else {
      user = existing[0];
      // नाम update
      await db.update(users).set({ name }).where(eq(users.email, email));
    }

    const now = new Date();
    const expiry = user.expiryDate ? new Date(user.expiryDate) : null;
    const isActive = user.status === "active" && expiry && now < expiry;
    const isTrial = user.status === "trial" && expiry && now < expiry;

    const token = await createSession(user.id, email, name, user.status, user.expiryDate);

    const redirectPath = isActive || isTrial ? "/dashboard" : "/expired";
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.set("session", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return response;

  } catch (e) {
    console.error("callback error:", e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}