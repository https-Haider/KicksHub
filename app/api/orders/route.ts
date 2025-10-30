// app/api/orders/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveOrder, getOrders } from "@/lib/orders.server";

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

function escapeHtml(s: any) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(n: number) {
  return `PKR ${Math.round(n)}`;
}

function renderItemsHtml(items: any[]) {
  if (!items || items.length === 0)
    return "<tr><td colspan=3 style='padding:8px;'>No items</td></tr>";
  return items
    .map(
      (it: any) =>
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

function confirmationHtml(order: any) {
  const itemsHtml = renderItemsHtml(order.items || []);
  const VERIFY_BASE_URL =
    process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, color:#111;">
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
    const body = await req.json();
    if (!body || !body.items || !body.email) {
      return NextResponse.json(
        { error: "Invalid order payload" },
        { status: 400 }
      );
    }

    // new orders are confirmed immediately (no OTP required)
    const created = await saveOrder({ ...body, status: "confirmed" });

    // send confirmation email (best-effort)
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: created.email,
        subject: `Order confirmed — ${created.id}`,
        html: confirmationHtml(created),
        text: `Your order ${created.id} is confirmed. Total ${created.total}`,
      });
    } catch (err: any) {
      console.error("Failed to send confirmation email:", err);
      // proceed without failing order creation
    }

    return NextResponse.json(created);
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
