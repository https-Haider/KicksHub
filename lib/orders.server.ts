// lib/orders.server.ts
import crypto from "crypto";
import { MongoClient } from "mongodb";

export type OrderItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
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
  status: "confirmed" | "shipped" | "delivered" | "otp_sent";
  createdAt: string;
  otpHash?: string | null;
  otpExpiresAt?: number | null; // epoch ms
  otpLastSentAt?: number | null; // epoch ms when OTP was last sent (rate limiting)
  trackingNumber?: string | null;
  carrier?: string | null;
};

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

function toOrder(doc: any): Order {
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
    status: doc.status || "confirmed",
    createdAt: doc.createdAt,
    otpHash: doc.otpHash ?? null,
    otpExpiresAt: doc.otpExpiresAt ?? null,
    otpLastSentAt: doc.otpLastSentAt ?? null,
    trackingNumber: doc.trackingNumber ?? null,
    carrier: doc.carrier ?? null,
  };
}

async function getCollection() {
  const client = await getClient();
  const db = client.db(MONGODB_DB);
  return db.collection(MONGODB_COLLECTION);
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

export async function updateOrderById(
  id: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const col = await getCollection();
  const update: any = { $set: { ...patch } };
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
