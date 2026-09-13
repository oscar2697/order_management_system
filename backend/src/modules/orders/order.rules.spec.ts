import { calculateOrderTotal, canTransition } from './order.rules';

describe('order rules', () => {
  describe('canTransition', () => {
    it('allows pending -> completed and pending -> cancelled', () => {
      expect(canTransition('pending', 'completed')).toBe(true);
      expect(canTransition('pending', 'cancelled')).toBe(true);
    });

    it('treats completed and cancelled as terminal states', () => {
      expect(canTransition('completed', 'pending')).toBe(false);
      expect(canTransition('completed', 'cancelled')).toBe(false);
      expect(canTransition('cancelled', 'pending')).toBe(false);
      expect(canTransition('cancelled', 'completed')).toBe(false);
    });

    it('is idempotent for the same state', () => {
      expect(canTransition('pending', 'pending')).toBe(true);
      expect(canTransition('completed', 'completed')).toBe(true);
    });
  });

  describe('calculateOrderTotal', () => {
    it('sums quantity * unit price', () => {
      expect(
        calculateOrderTotal([
          { quantity: 2, unitPrice: 10 },
          { quantity: 1, unitPrice: 5.5 },
        ]),
      ).toBe(25.5);
    });

    it('does not leak floating point artifacts', () => {
      // 0.1 + 0.2 style inputs: result must be exactly 0.3
      const total = calculateOrderTotal([
        { quantity: 1, unitPrice: 0.1 },
        { quantity: 1, unitPrice: 0.2 },
      ]);
      expect(total).toBe(0.3);
    });

    it('returns 0 for no items', () => {
      expect(calculateOrderTotal([])).toBe(0);
    });
  });
});
