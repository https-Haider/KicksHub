// app/api/send-otp/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  getOrderById,
  updateOrderById,
  hashOtpSync,
} from "@/lib/orders.server";

const EXPIRE_MIN = Number(process.env.OTP_EXPIRE_MINUTES ?? 10);
const RESEND_COOLDOWN_SEC = Number(process.env.OTP_RESEND_COOLDOWN_SEC ?? 30);
const VERIFY_BASE_URL = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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
  return `$${n.toFixed(2)}`;
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

function generateOtpHtml(order: Order, otp: string) {
  const itemsHtml = renderItemsHtml(order.items || []);
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#111;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e9e9e9;border-radius:8px;overflow:hidden;">
      <div style="background:#0b6;padding:18px 24px;color:#fff;display:flex;align-items:center;gap:12px;">
        <div style="font-weight:700;font-size:18px">Thrift Shoes</div>
        <div style="margin-left:auto;font-size:12px;opacity:.95">Order verification</div>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hi ${escapeHtml(
          order.customerName || order.email
        )},</p>
        <p style="margin:0 0 18px;">Use the code below to verify your order <strong>${escapeHtml(
          order.id
        )}</strong>. The code expires in ${EXPIRE_MIN} minutes.</p>

        <div style="text-align:center;margin:18px 0;">
          <div style="display:inline-block;padding:18px 28px;border-radius:8px;background:#f7f7f7;font-size:28px;letter-spacing:6px;font-weight:700;color:#0a6;">${otp}</div>
        </div>

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

        <p style="margin:18px 0 0;font-size:13px;color:#666">Or click <a href="${VERIFY_BASE_URL}/verify/${encodeURIComponent(
    order.id
  )}">here to verify online</a>.</p>
      </div>

      <div style="background:#fafafa;padding:12px 20px;font-size:12px;color:#777;text-align:center">Questions? Reply to this email or contact our support.</div>
    </div>
  </div>
  `;
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId)
      return NextResponse.json({ error: "orderId required" }, { status: 400 });

    const order = await getOrderById(orderId);
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // rate limit: if last sent is recent, refuse with 429 and seconds remaining
    const now = Date.now();
    const last = order.otpLastSentAt ?? 0;
    const since = now - last;
    if (last && since < RESEND_COOLDOWN_SEC * 1000) {
      const retryAfter = Math.ceil((RESEND_COOLDOWN_SEC * 1000 - since) / 1000);
      return NextResponse.json(
        { error: "OTP recently sent", retryAfterSeconds: retryAfter },
        { status: 429 }
      );
    }

    const otp = makeOtp();
    const otpHash = hashOtpSync(otp);
    const expiresAt = Date.now() + EXPIRE_MIN * 60 * 1000;

    // send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: order.email,
      subject: `Your verification code — ${order.id}`,
      html: generateOtpHtml(order, otp),
      text: `Your ThriftShoes verification code for order ${order.id} is ${otp} (expires in ${EXPIRE_MIN} minutes).`,
    });

    // persist OTP only after successful send
    await updateOrderById(orderId, {
      otpHash,
      otpExpiresAt: expiresAt,
      otpLastSentAt: Date.now(),
      status: "otp_sent",
    });

    return NextResponse.json({
      ok: true,
      sentTo: order.email.replace(/^(.).+@/, "$1***@"),
      cooldownSeconds: RESEND_COOLDOWN_SEC,
    });
  } catch (err: unknown) {
    console.error("send-otp error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
