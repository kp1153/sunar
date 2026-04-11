"use server";

import { db } from "@/db"; 
import { girvi } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addGirvi(formData) {
  const customerName = formData.get("customerName");
  const itemDetails = formData.get("itemDetails");
  const loanAmount = parseInt(formData.get("loanAmount"));
  const interestRate = parseFloat(formData.get("interestRate"));

  try {
    await db.insert(girvi).values({
      customerName,
      itemDetails,
      loanAmount,
      interestRate,
      // तारीख डिफ़ॉल्ट रूप से आज की सेट होगी
    });

    revalidatePath("/dashboard"); // डैशबोर्ड अपडेट करने के लिए
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}