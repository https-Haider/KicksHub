// lib/orders.server.ts
import crypto from "crypto";
import { MongoClient, Document } from "mongodb";
import { calculateTotals } from "@/lib/commerce";

export type OrderItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: number | string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: "pending_payment" | "confirmed" | "shipped" | "delivered" | "cancelled" | "otp_sent";
  paymentMethod?: string;
  createdAt: string;
  otpHash?: string | null;
  otpExpiresAt?: number | null; // epoch ms
  otpLastSentAt?: number | null; // epoch ms when OTP was last sent (rate limiting)
  trackingNumber?: string | null;
  carrier?: string | null;
  paymentStatus?: "pending" | "awaiting_payment" | "paid" | "failed";
  idempotencyKey?: string;
};

interface OrderDocument extends Document {
  id: string;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: Order["status"];
  paymentMethod?: Order["paymentMethod"];
  paymentStatus?: Order["paymentStatus"];
  idempotencyKey?: Order["idempotencyKey"];
  createdAt?: string;
  otpHash?: string | null;
  otpExpiresAt?: number | null;
  otpLastSentAt?: number | null;
  trackingNumber?: string | null;
  carrier?: string | null;
}

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB ?? "edm";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION ?? "orders";

let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (
    cachedClient &&
    (cachedClient as any).topology &&
    (cachedClient as any).isConnected !== false
  )
    return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

function makeOrderId(): string {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)
    .toUpperCase()}`;
}

function toOrder(doc: OrderDocument): Order {
  // ensure shape
  return {
    id: doc.id,
    items: doc.items || [],
    subtotal: doc.subtotal || 0,
    shipping: doc.shipping || 0,
    tax: doc.tax || 0,
    total: doc.total || 0,
    customerName: doc.customerName || "",
    email: doc.email || "",
    phone: doc.phone,
    address: doc.address,
    city: doc.city,
    state: doc.state,
    zipCode: doc.zipCode,
    status: (doc.status as Order["status"]) || "confirmed",
    createdAt: doc.createdAt || new Date(0).toISOString(),
    otpHash: doc.otpHash ?? null,
    otpExpiresAt: doc.otpExpiresAt ?? null,
    otpLastSentAt: doc.otpLastSentAt ?? null,
    trackingNumber: doc.trackingNumber ?? null,
    carrier: doc.carrier ?? null,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    idempotencyKey: doc.idempotencyKey,
  };
}

async function getCollection() {
  const client = await getClient();
  const db = client.db(MONGODB_DB);
  return db.collection<OrderDocument>(MONGODB_COLLECTION);
}

export async function getOrders(): Promise<Order[]> {
  const col = await getCollection();
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const col = await getCollection();
  const doc = await col.findOne({ id });
  return doc ? toOrder(doc) : null;
}

export async function saveOrder(
  order: Omit<Order, "id" | "createdAt">
): Promise<Order> {
  const full: Order = {
    ...order,
    id: makeOrderId(),
    createdAt: new Date().toISOString(),
    otpHash: null,
    otpExpiresAt: null,
    otpLastSentAt: null,
    trackingNumber: null,
    carrier: null,
  };
  const col = await getCollection();
  await col.insertOne({ ...full });
  return full;
}

type OrderRequest = Pick<Order, "customerName" | "email" | "phone" | "address" | "city" | "state" | "zipCode"> & {
  items: Array<{ productId: number; quantity: number; selectedSize?: number | string }>;
  paymentMethod: "cod" | "stripe";
  idempotencyKey: string;
};

export async function createValidatedOrder(input: OrderRequest): Promise<Order> {
  if (!input.idempotencyKey || !input.items?.length) throw new Error("INVALID_ORDER");
  const client = await getClient();
  const session = client.startSession();
  try {
    return await session.withTransaction(async () => {
      const db = client.db(MONGODB_DB);
      const orders = db.collection<OrderDocument>(MONGODB_COLLECTION);
      const products = db.collection(process.env.MONGODB_PRODUCTS_COLLECTION ?? "products");
      const duplicate = await orders.findOne({ idempotencyKey: input.idempotencyKey }, { session });
      if (duplicate) return toOrder(duplicate as OrderDocument);
      const validated: OrderItem[] = [];
      for (const requested of input.items) {
        if (!Number.isInteger(requested.quantity) || requested.quantity < 1) throw new Error("INVALID_QUANTITY");
        const product = await products.findOne({ id: requested.productId, isActive: { $ne: false }, published: { $ne: false } }, { session });
        if (!product || product.inStock === false) throw new Error("PRODUCT_UNAVAILABLE");
        if ((product.sizes?.length || 0) && !product.sizes.map(String).includes(String(requested.selectedSize ?? ""))) throw new Error("INVALID_SIZE");
        const stock = Number(product.stockQuantity ?? 0);
        if (stock < requested.quantity) throw new Error("INSUFFICIENT_STOCK");
        validated.push({ productId: product.id, productName: product.name, price: Number(product.price), quantity: requested.quantity, selectedSize: requested.selectedSize });
      }
      const totals = calculateTotals(validated);
      const full: Order = { ...input, ...totals, tax: 0, id: makeOrderId(), createdAt: new Date().toISOString(), status: input.paymentMethod === "stripe" ? "pending_payment" : "confirmed", paymentStatus: input.paymentMethod === "stripe" ? "awaiting_payment" : "pending", items: validated, otpHash: null, otpExpiresAt: null, otpLastSentAt: null, trackingNumber: null, carrier: null };
      for (const item of validated) {
        const result = await products.updateOne({ id: item.productId, stockQuantity: { $gte: item.quantity } }, { $inc: { stockQuantity: -item.quantity } }, { session });
        if (result.modifiedCount !== 1) throw new Error("INSUFFICIENT_STOCK");
      }
      await orders.insertOne(full, { session });
      return full;
    }) as Order;
  } finally { await session.endSession(); }
}

export async function updateOrderById(
  id: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const col = await getCollection();
  const update = { $set: { ...patch } };
  await col.updateOne({ id }, update);
  const doc = await col.findOne({ id });
  return doc ? toOrder(doc) : null;
}

export async function removeOrder(id: string): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ id });
}

/* simple sha256 hasher for OTPs */
export function hashOtpSync(otp: string): string {
  return crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
}
