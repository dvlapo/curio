import type { Money } from '../types';

export function formatMoney(value: Money | number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export const formatNaira = formatMoney;
