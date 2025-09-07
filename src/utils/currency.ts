export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

export const parseCurrency = (value: string): number => {
  const cleanedValue = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
};

export const formatAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};