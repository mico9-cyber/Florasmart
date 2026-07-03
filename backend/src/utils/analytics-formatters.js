export function formatCurrency(value) {
  const num = Number(value) || 0;
  return Math.round(num);
}

export function formatPercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function safeNumber(value) {
  return Number(value) || 0;
}
