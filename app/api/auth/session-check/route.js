import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);

  if (!session) {
    return Response.json({ email: null }, { status: 401 });
  }

  return Response.json({
    email: session.email,
    name: session.name,
    status: session.status,
    expiryDate: session.expiryDate,
  });
}