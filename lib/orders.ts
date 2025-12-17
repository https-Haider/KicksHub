// lib/orders.ts
/* Orders helper (localStorage-backed) with OTP support for demo/local flows.
 *
 * NOTE: This is intended for demo/local use only. For production, move OTP
 * generation, hashing, emailing, and order persistence to a secure server-side
 * implementation and a real database.
 */

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: number | string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: "confirmed" | "shipped" | "delivered" | "otp_sent";
  createdAt: string;

  // OTP internals (demo only)
  otpHash?: string | null;
  otpExpiresAt?: number | null; // epoch ms
  trackingNumber?: string | null;
  carrier?: string | null;
}

const STORAGE_KEY = "thriftshoes_orders";
const DEFAULT_OTP_EXPIRE_MIN = 10;

/* ----------------------------- Utilities ------------------------------ */

export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 11)
    .toUpperCase()}`;
}

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readStoredOrders(): Order[] {
  if (!isBrowser()) return [];
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as Order[]) : [];
  } catch (e) {
    console.error("Failed to parse orders from localStorage:", e);
    return [];
  }
}

function writeStoredOrders(orders: Order[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to write orders to localStorage:", e);
  }
}

/* ----------------------------- CRUD helpers --------------------------- */

export function getOrders(): Order[] {
  return readStoredOrders();
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((order) => order.id === id);
}

/**
 * Save a new order. Returns the full Order with id and createdAt.
 */
export function saveOrder(
  order: Omit<Order, "id" | "createdAt" | "otpHash" | "otpExpiresAt">
): Order {
  const fullOrder: Order = {
    ...order,
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: order?.status ?? "confirmed",
    otpHash: null,
    otpExpiresAt: null,
    trackingNumber: null,
    carrier: null,
  };

  const orders = readStoredOrders();
  orders.push(fullOrder);
  writeStoredOrders(orders);
  return fullOrder;
}

export function updateOrder(updated: Order): Order {
  const orders = readStoredOrders();
  const idx = orders.findIndex((o) => o.id === updated.id);
  if (idx === -1) {
    orders.push(updated);
  } else {
    orders[idx] = updated;
  }
  writeStoredOrders(orders);
  return updated;
}

export async function updateOrderById(
  id: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const orders = readStoredOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const updated: Order = {
    ...orders[idx],
    ...patch,
  };
  orders[idx] = updated;
  writeStoredOrders(orders);
  return updated;
}

export function removeOrder(id: string) {
  const orders = readStoredOrders().filter((o) => o.id !== id);
  writeStoredOrders(orders);
}

/* ----------------------------- OTP helpers ---------------------------- */

/**
 * Browser/Node-friendly SHA-256 hex hasher.
 * Uses Web Crypto (browser or Node's webcrypto when available).
 */
export async function hashOtp(otp: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(otp);

  // Try Web Crypto first (browser or Node >= 16.9 with globalThis.crypto)
  const subtle =
    (globalThis as any).crypto?.subtle ??
    // dynamic import fallback for older Node environments
    (await import("crypto")).webcrypto?.subtle;

  if (!subtle) {
    // Should not happen in most environments, but fallback to simple hashing via node's crypto if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodeCrypto = require("crypto");
      return nodeCrypto.createHash("sha256").update(otp).digest("hex");
    } catch (err) {
      throw new Error("No crypto implementation available to hash OTP");
    }
  }

  const digest = await subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest as ArrayBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a 6-digit numeric OTP (string).
 * Demo-only: in production, generate/send OTP server-side.
 */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Mark an order as otp_sent: stores hashed OTP + expiry, updates status.
 * Returns the plain OTP for demo purposes (so a dev/test can "send" it).
 * DO NOT return plain OTP from a server in production.
 */
export async function markOtpSent(
  orderId: string,
  otpPlain?: string,
  expireMinutes = DEFAULT_OTP_EXPIRE_MIN
): Promise<{ ok: boolean; otp?: string; error?: string }> {
  const orders = readStoredOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { ok: false, error: "Order not found" };

  const plain = otpPlain ?? generateOtp();
  try {
    const otpHash = await hashOtp(plain);
    const expiresAt = Date.now() + expireMinutes * 60 * 1000;
    orders[idx].otpHash = otpHash;
    orders[idx].otpExpiresAt = expiresAt;
    orders[idx].status = "otp_sent";
    writeStoredOrders(orders);
    return { ok: true, otp: plain };
  } catch (e) {
    console.error("markOtpSent error:", e);
    return { ok: false, error: "Failed to create OTP" };
  }
}

/**
 * Verify OTP for an order. If valid and not expired:
 * - clears otp fields
 * - sets status to 'confirmed'
 */
export async function verifyOtpForOrder(
  orderId: string,
  otpPlain: string
): Promise<{ ok: boolean; error?: string }> {
  const orders = readStoredOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { ok: false, error: "Order not found" };

  const order = orders[idx];
  if (!order.otpHash || !order.otpExpiresAt)
    return { ok: false, error: "No OTP requested for this order" };

  if (Date.now() > order.otpExpiresAt) {
    return { ok: false, error: "OTP expired" };
  }

  try {
    const providedHash = await hashOtp(String(otpPlain).trim());
    if (providedHash !== order.otpHash) {
      return { ok: false, error: "Invalid OTP" };
    }

    // success: confirm order and remove OTP internals
    orders[idx].status = "confirmed";
    orders[idx].otpHash = null;
    orders[idx].otpExpiresAt = null;
    writeStoredOrders(orders);
    return { ok: true };
  } catch (e) {
    console.error("verifyOtpForOrder error:", e);
    return { ok: false, error: "Verification failed" };
  }
}
