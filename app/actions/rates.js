"use server";

import { db } from "@/db"; // तुम्हारे कनेक्शन वाली फाइल
import { rates } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function updateRate(formData) {
  const metal = formData.get("metal");
  const price = parseFloat(formData.get("price"));

  // Turso में डेटा अपडेट या इंसर्ट करना
  await db.insert(rates).values({
    metal,
    price,
    purity: metal === "Gold" ? "24K" : "999",
  }).onConflictDoUpdate({
    target: [rates.metal],
    set: { price, updatedAt: new Date().toISOString() },
  });

  revalidatePath("/"); // होम पेज का डेटा रिफ्रेश करने के लिए
}