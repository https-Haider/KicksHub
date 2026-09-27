import { describe, expect, it } from "vitest";
import { calculateShipping, calculateTotals, clampQuantity, formatPKR } from "./commerce";

describe("commerce calculations", () => {
  it("charges PKR 200 up to and including the threshold", () => {
    expect(calculateShipping(5000)).toBe(200);
    expect(calculateShipping(5001)).toBe(0);
  });
  it("calculates all totals from authoritative line prices", () => {
    expect(calculateTotals([{ price: 2500, quantity: 2 }])).toEqual({ subtotal: 5000, shipping: 200, tax: 0, total: 5200 });
  });
  it("limits cart quantities to available stock", () => {
    expect(clampQuantity(0, 3)).toBe(1);
    expect(clampQuantity(10, 3)).toBe(3);
  });
  it("formats PKR consistently", () => expect(formatPKR(25800)).toBe("PKR 25,800"));
});
