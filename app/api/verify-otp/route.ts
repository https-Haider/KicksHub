// app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  getOrderById,
  updateOrderById,
  hashOtpSync,
} from "@/lib/orders.server";

const VERIFY_BASE_URL = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  email: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  otpHash?: string | null;
  otpExpiresAt?: number | null;
  otpLastSentAt?: number | null;
  status?: string;
}

function formatMoney(n: number) {
  // display as PKR without decimals
  return `PKR ${Math.round(n)}`;
}

function renderItemsHtml(items: OrderItem[]) {
  if (!items || items.length === 0)
    return "<tr><td colspan=3 style='padding:8px;'>No items</td></tr>";
  return items
    .map(
      (it: OrderItem) =>
        `<tr><td style='padding:8px;border-bottom:1px solid #eee;'>${escapeHtml(
          it.productName
        )}</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>x${
          it.quantity
        }</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:right;'>${formatMoney(
          it.price * it.quantity
        )}</td></tr>`
    )
    .join("");
}

function escapeHtml(s: string | number | undefined) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function confirmationHtml(order: Order) {
  const itemsHtml = renderItemsHtml(order.items || []);
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#111;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e9e9e9;border-radius:8px;overflow:hidden;">
      <div style="background:#0b6;padding:18px 24px;color:#fff;display:flex;align-items:center;gap:12px;">
        <div style="font-weight:700;font-size:18px">KicksHub</div>
        <div style="margin-left:auto;font-size:12px;opacity:.95">Order confirmation</div>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hi ${escapeHtml(
          order.customerName || order.email
        )},</p>
        <p style="margin:0 0 18px;">Thanks — your order <strong>${escapeHtml(
          order.id
        )}</strong> is confirmed. We've started processing it and will send updates when it ships.</p>

        <h4 style="margin:18px 0 8px;">Order summary</h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">Item</th>
              <th style="text-align:center;padding:8px;border-bottom:1px solid #eee">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #eee">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="display:flex;justify-content:space-between;font-weight:600;padding-top:8px;border-top:1px solid #eee"> 
          <div>Total</div>
          <div>${formatMoney(order.total || 0)}</div>
        </div>

        <p style="margin:18px 0 0;font-size:13px;color:#666">View your order: <a href="${VERIFY_BASE_URL}/orders/${encodeURIComponent(
    order.id
  )}">${VERIFY_BASE_URL}/orders/${encodeURIComponent(order.id)}</a></p>
      </div>
  <div style="background:#fafafa;padding:12px 20px;font-size:12px;color:#777;text-align:center">Thanks for shopping with KicksHub.</div>
    </div>
  </div>
  `;
}

export async function POST(req: Request) {
  try {
    const { orderId, otp } = await req.json();
    if (!orderId || !otp)
      return NextResponse.json(
        { error: "orderId and otp required" },
        { status: 400 }
      );

    const order = await getOrderById(orderId);
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (!order.otpHash || !order.otpExpiresAt)
      return NextResponse.json({ error: "No OTP requested" }, { status: 400 });
    if (Date.now() > order.otpExpiresAt)
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });

    const providedHash = hashOtpSync(String(otp));
    if (providedHash !== order.otpHash)
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    // mark confirmed & clear otp fields
    await updateOrderById(orderId, {
      status: "confirmed",
      otpHash: null,
      otpExpiresAt: null,
      otpLastSentAt: null,
    });

    // send confirmation email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: order.email,
      subject: `Order confirmed — ${order.id}`,
      html: confirmationHtml(order),
      text: `Your order ${order.id} is confirmed. Total $${order.total.toFixed(
        2
      )}.`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error(
      "verify-otp error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
