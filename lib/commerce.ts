export const SHIPPING_FEE_PKR = 200;
export const FREE_SHIPPING_THRESHOLD_PKR = 5000;

export function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function calculateShipping(subtotal: number): number {
  return subtotal > FREE_SHIPPING_THRESHOLD_PKR ? 0 : SHIPPING_FEE_PKR;
}

export function calculateTotals(
  items: Array<{ price: number; quantity: number }>
) {
  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shipping = items.length ? calculateShipping(subtotal) : 0;
  return { subtotal, shipping, tax: 0, total: subtotal + shipping };
}

export function clampQuantity(quantity: number, stockQuantity?: number): number {
  const maximum = Math.max(0, Math.floor(stockQuantity ?? 1));
  return Math.min(Math.max(1, Math.floor(quantity || 1)), maximum);
}
