import { db } from "@/db";
import { bills } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function GET(request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) return Response.json({}, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "today";

  const now = new Date();
  let start;

  if (period === "today") {
    start = new Date();
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start = new Date();
    start.setDate(start.getDate() - 7);
  } else if (period === "month") {
    start = new Date();
    start.setMonth(start.getMonth() - 1);
  } else {
    start = new Date();
    start.setHours(0, 0, 0, 0);
  }

  const allBills = await db
    .select()
    .from(bills)
    .where(eq(bills.userId, session.userId));

  const filtered = allBills.filter((b) => new Date(b.createdAt) >= start);

  const totalSale = filtered.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalGst = filtered.reduce((s, b) => s + (b.gst || 0), 0);
  const totalMaking = filtered.reduce((s, b) => s + (b.makingCharge || 0), 0);

  const goldWeight = filtered.filter((b) => b.metalType === "सोना")
    .reduce((s, b) => s + (b.netWeight || 0), 0);
  const silverWeight = filtered.filter((b) => b.metalType === "चाँदी")
    .reduce((s, b) => s + (b.netWeight || 0), 0);

  const cashSales = filtered.filter((b) => b.paymentMode === "नकद")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const upiSales = filtered.filter((b) => b.paymentMode === "UPI")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const udhaarSales = filtered.filter((b) => b.paymentMode === "उधार")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  return Response.json({
    period,
    billCount: filtered.length,
    totalSale: Math.round(totalSale),
    totalGst: Math.round(totalGst),
    totalMaking: Math.round(totalMaking),
    goldWeight: Number(goldWeight.toFixed(2)),
    silverWeight: Number(silverWeight.toFixed(2)),
    cashSales: Math.round(cashSales),
    upiSales: Math.round(upiSales),
    udhaarSales: Math.round(udhaarSales),
  });
}