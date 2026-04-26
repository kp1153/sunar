// Bill calculation — सब एक जगह ताकि bill page और URD दोनों use कर सकें

export function calcBillTotal({ netWeight, ratePerTen, makingCharge, oldGoldWeight, oldGoldRate }) {
  const net = parseFloat(netWeight) || 0;
  const rate = parseFloat(ratePerTen) || 0;
  const making = parseFloat(makingCharge) || 0;
  const oldW = parseFloat(oldGoldWeight) || 0;
  const oldR = parseFloat(oldGoldRate) || 0;

  if (net <= 0 || rate <= 0) {
    return { error: "वजन और भाव दोनों डालें" };
  }

  const metalValue = (rate * net) / 10;
  const subtotal = metalValue + making;
  const gst = subtotal * 0.03;
  const totalBeforeAdjust = subtotal + gst;

  // पुराने सोने का मूल्य (अगर है)
  const oldGoldValue = oldW > 0 && oldR > 0 ? (oldW * oldR) / 10 : 0;

  // असली देनी रकम
  const netPayable = totalBeforeAdjust - oldGoldValue;

  return {
    metalValue: Math.round(metalValue),
    subtotal: Math.round(subtotal),
    gst: Math.round(gst),
    totalAmount: Math.round(totalBeforeAdjust),
    oldGoldValue: Math.round(oldGoldValue),
    netPayable: Math.round(netPayable),
  };
}