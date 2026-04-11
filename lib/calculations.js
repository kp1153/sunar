export function calculateInterest(amount, rate, startDate) {
  const start = new Date(startDate);
  const today = new Date();
  
  // दिनों का अंतर निकालें
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // महीने (30 दिन का एक महीना मानकर)
  const months = diffDays / 30;
  
  // ब्याज = (मूलधन * दर * समय) / 100
  const interest = (amount * rate * months) / 100;
  
  return {
    interest: Math.round(interest),
    total: Math.round(amount + interest),
    days: diffDays
  };
}