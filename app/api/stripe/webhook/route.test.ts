import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signature: "signed", constructEvent: vi.fn(), getOrder: vi.fn(), updateOrder: vi.fn(), sendMail: vi.fn(),
}));
vi.mock("next/headers", () => ({ headers: async () => ({ get: () => mocks.signature }) }));
vi.mock("@/lib/stripe", () => ({ getStripe: async () => ({ webhooks: { constructEvent: mocks.constructEvent } }) }));
vi.mock("@/lib/orders.server", () => ({ getOrderById: mocks.getOrder, updateOrderById: mocks.updateOrder }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: mocks.sendMail }) } }));
let POST: typeof import("./route").POST;
const order = { id: "ORD-1", status: "pending_payment", paymentStatus: "awaiting_payment", email: "buyer@example.test", items: [], total: 1000 };
function event(type: string, payment_status = "paid") {
  return { type, data: { object: { metadata: { orderId: "ORD-1" }, payment_status } } };
}
function request() { return new Request("http://localhost/api/stripe/webhook", { method: "POST", body: "signed-payload" }); }

beforeAll(async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "test-secret");
  ({ POST } = await import("./route"));
});
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.clearAllMocks();
  mocks.signature = "signed";
  mocks.constructEvent.mockReturnValue(event("checkout.session.completed"));
  mocks.getOrder.mockResolvedValue(order);
  mocks.updateOrder.mockResolvedValue(order);
  mocks.sendMail.mockResolvedValue({});
});

describe("Stripe webhook regressions", () => {
  it("marks a verified paid session as paid and sends confirmation", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.updateOrder).toHaveBeenCalledWith("ORD-1", { status: "confirmed", paymentStatus: "paid" });
    expect(mocks.sendMail).toHaveBeenCalledOnce();
  });
  it("does not reset fulfillment or send email again for a paid order", async () => {
    mocks.getOrder.mockResolvedValue({ ...order, status: "shipped", paymentStatus: "paid" });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
  it("does not cancel a paid order for a late expiry event", async () => {
    mocks.constructEvent.mockReturnValue(event("checkout.session.expired"));
    mocks.getOrder.mockResolvedValue({ ...order, paymentStatus: "paid" });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });
  it("does not mark an unpaid completed session as paid", async () => {
    mocks.constructEvent.mockReturnValue(event("checkout.session.completed", "unpaid"));
    expect((await POST(request())).status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
  it("returns a retryable response when order persistence fails", async () => {
    mocks.getOrder.mockRejectedValue(new Error("database unavailable"));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
  it("rejects invalid signatures before touching an order", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("invalid signature"); });
    expect((await POST(request())).status).toBe(400);
    expect(mocks.getOrder).not.toHaveBeenCalled();
    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });
});
