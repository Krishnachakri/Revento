// ============================================================================
// ReVento - Financial & Currency Calculation Utilities
// All prices internally stored in integer minor currency units (paise/cents)
// 100 paise = ₹1.00 INR (or 100 cents = $1.00 USD)
// ============================================================================

export const DEFAULT_CURRENCY = 'INR';

/**
 * Format integer paise/cents into standard currency representation
 * e.g., 450000 paise -> "₹4,500" or "₹4,500.00"
 */
export function formatCurrency(
  cents: number,
  options: {
    currency?: string;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { currency = 'INR', showDecimals = false, compact = false } = options;
  const majorUnits = cents / 100;

  if (compact && Math.abs(majorUnits) >= 100000) {
    // Format Indian lakhs / crores if INR
    if (currency === 'INR') {
      if (Math.abs(majorUnits) >= 10000000) {
        return `₹${(majorUnits / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(majorUnits / 100000).toFixed(2)} Lakh`;
    }
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(majorUnits);
}

/**
 * Parse a standard currency input (e.g. "4500" or "4,500") into integer cents/paise
 */
export function parseToCents(amount: number | string): number {
  if (typeof amount === 'number') {
    return Math.round(amount * 100);
  }
  const cleanStr = amount.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

/**
 * Calculate rental days between start and end date (inclusive)
 * e.g. 2026-11-01 to 2026-11-03 = 3 days
 */
export function calculateRentalDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  
  // Normalize to UTC midnight to avoid DST/timezone offset issues
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  
  const diffTime = endUtc - startUtc;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(1, diffDays);
}

/**
 * Calculate per-item line subtotal in cents
 */
export function calculateLineSubtotalCents(
  unitDailyPriceCents: number,
  quantity: number,
  rentalDays: number
): number {
  if (unitDailyPriceCents < 0 || quantity <= 0 || rentalDays <= 0) return 0;
  return Math.round(unitDailyPriceCents * quantity * rentalDays);
}

/**
 * Format date nicely for event displays (e.g., "Nov 15, 2026")
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
