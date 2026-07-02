const rwfFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'RWF',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount, currency = 'RWF') {
  if (amount == null || isNaN(amount)) return 'RWF 0';
  if (currency === 'RWF') {
    return rwfFormatter.format(amount);
  }
  const num = Number(amount);
  return `${currency} ${num.toLocaleString('en-US')}`;
}
