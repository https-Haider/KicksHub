import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => {
  const orders = { findOne: vi.fn(), insertOne: vi.fn() };
  const products = { findOne: vi.fn(), updateOne: vi.fn() };
  const session = { withTransaction: vi.fn(), endSession: vi.fn() };
  return { orders, products, session, connect: vi.fn() };
});
vi.mock("mongodb", () => ({
  MongoClient: class {
    connect = db.connect;
    startSession = () => db.session;
    db = () => ({ collection: (name: string) => name === "products" ? db.products : db.orders });
  },
}));
import { createValidatedOrder } from "./orders.server";

const input = {
  customerName: "Test buyer", email: "buyer@example.test", paymentMethod: "stripe" as const,
  idempotencyKey: "request-1", items: [{ productId: 7, quantity: 2, selectedSize: "42" }],
};
const product = { id: 7, name: "Test pair", price: 2500, sizes: ["42"], stockQuantity: 3, inStock: true };

beforeEach(() => {
  vi.clearAllMocks();
  db.session.withTransaction.mockImplementation(async callback => callback());
  db.orders.findOne.mockResolvedValue(null);
  db.products.findOne.mockResolvedValue(product);
  db.products.updateOne.mockResolvedValue({ modifiedCount: 1 });
});

describe("validated order persistence", () => {
  it("uses authoritative prices and keeps stock writes inside the transaction", async () => {
    const order = await createValidatedOrder(input);
    expect(order).toMatchObject({ subtotal: 5000, shipping: 200, tax: 0, total: 5200, paymentStatus: "awaiting_payment" });
    expect(db.products.updateOne).toHaveBeenCalledWith(
      { id: 7, stockQuantity: { $gte: 2 } }, { $inc: { stockQuantity: -2 } }, { session: db.session },
    );
    expect(db.orders.insertOne).toHaveBeenCalledWith(order, { session: db.session });
    expect(db.session.endSession).toHaveBeenCalledOnce();
  });
  it("returns an existing order without reserving stock again on a sequential retry", async () => {
    db.orders.findOne.mockResolvedValue({ id: "ORD-existing", ...input, paymentStatus: "paid", status: "confirmed" });
    expect(await createValidatedOrder(input)).toMatchObject({ id: "ORD-existing", idempotencyKey: "request-1", paymentMethod: "stripe", paymentStatus: "paid" });
    expect(db.products.updateOne).not.toHaveBeenCalled();
    expect(db.orders.insertOne).not.toHaveBeenCalled();
  });
  it("rejects insufficient stock before writing and ends the session", async () => {
    db.products.findOne.mockResolvedValue({ ...product, stockQuantity: 1 });
    await expect(createValidatedOrder(input)).rejects.toThrow("INSUFFICIENT_STOCK");
    expect(db.products.updateOne).not.toHaveBeenCalled();
    expect(db.orders.insertOne).not.toHaveBeenCalled();
    expect(db.session.endSession).toHaveBeenCalledOnce();
  });
  it("propagates a competing stock update failure so the database transaction can abort", async () => {
    db.products.updateOne.mockResolvedValue({ modifiedCount: 0 });
    await expect(createValidatedOrder(input)).rejects.toThrow("INSUFFICIENT_STOCK");
    expect(db.orders.insertOne).not.toHaveBeenCalled();
    expect(db.session.endSession).toHaveBeenCalledOnce();
  });
  it("rejects invalid size and quantity before reserving stock", async () => {
    await expect(createValidatedOrder({ ...input, items: [{ ...input.items[0], selectedSize: "99" }] })).rejects.toThrow("INVALID_SIZE");
    await expect(createValidatedOrder({ ...input, items: [{ ...input.items[0], quantity: 0 }] })).rejects.toThrow("INVALID_QUANTITY");
    expect(db.products.updateOne).not.toHaveBeenCalled();
  });
});
