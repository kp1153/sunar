"use server";

export async function sendWhatsAppReceipt(customerPhone, billDetails) {
  // व्हाट्सएप मैसेज का फॉर्मेट
  const message = `*श्री गणेशाय नमः* ✨%0A%0A*स्वर्णशिल्पी ज्वेलर्स*%0A--------------------------%0Aप्रिय ग्राहक, आपकी गिरवी/बिल की जानकारी नीचे दी गई है:%0A%0A*आइटम:* ${billDetails.item}%0A*मूलधन:* ₹${billDetails.amount}%0A*तारीख:* ${billDetails.date}%0A%0A*निशांत सॉफ्टवेयर सॉल्यूशन्स*`;

  const whatsappUrl = `https://wa.me/91${customerPhone}?text=${message}`;
  
  return whatsappUrl;
}