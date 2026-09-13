import { ORDER_TRANSITIONS, OrderStatus } from './order.entity';

/** Pure business rules for orders, kept framework-free so they are trivially testable. */

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true; // idempotent re-submission of the same state
  return ORDER_TRANSITIONS[from].includes(to);
}

/**
 * Money math is done in integer cents and converted back, so binary
 * floating-point artifacts never leak into persisted totals.
 */
export function calculateOrderTotal(
  items: ReadonlyArray<{ quantity: number; unitPrice: number }>,
): number {
  const cents = items.reduce(
    (acc, item) => acc + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
  return cents / 100;
}
