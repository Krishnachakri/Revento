import { describe, it, expect } from 'vitest';
import {
  calculateRentalDays,
  calculateLineSubtotalCents,
  formatCurrency,
  parseToCents,
} from '../src/lib/currency';

describe('Financial & Currency Calculations', () => {
  it('accurately calculates rental days inclusively', () => {
    // Nov 20 to Nov 22 = 3 days (Nov 20, Nov 21, Nov 22)
    const days3 = calculateRentalDays('2026-11-20', '2026-11-22');
    expect(days3).toBe(3);

    // Single day event
    const days1 = calculateRentalDays('2026-11-20', '2026-11-20');
    expect(days1).toBe(1);

    // 7 day festival
    const days7 = calculateRentalDays('2026-11-01', '2026-11-07');
    expect(days7).toBe(7);
  });

  it('calculates line subtotals accurately using integer minor units (paise)', () => {
    // ₹4,500.00/day = 450,000 paise
    // 12 units for 3 days = 450,000 * 12 * 3 = 16,200,000 paise (₹1,62,000.00)
    const subtotal = calculateLineSubtotalCents(450000, 12, 3);
    expect(subtotal).toBe(16200000);
    expect(formatCurrency(subtotal)).toBe('₹1,62,000');
  });

  it('handles parsing rupees to cents/paise accurately', () => {
    expect(parseToCents(4500)).toBe(450000);
    expect(parseToCents('4,500')).toBe(450000);
    expect(parseToCents('₹12,00,000')).toBe(120000000);
    expect(parseToCents(0)).toBe(0);
  });

  it('correctly handles zero or negative inputs defensively', () => {
    expect(calculateLineSubtotalCents(-500, 2, 1)).toBe(0);
    expect(calculateLineSubtotalCents(500, 0, 1)).toBe(0);
    expect(calculateLineSubtotalCents(500, 2, 0)).toBe(0);
  });
});
