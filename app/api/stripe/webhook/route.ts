import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { updateOrderById, getOrderById, Order } from "@/lib/orders.server";
import nodemailer from "nodemailer";

// Stripe webhook secret - get from Stripe Dashboard > Webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

function escapeHtml(s: string | number | undefined) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(n: number) {
  return `PKR ${Math.round(n)}`;
}

function renderItemsHtml(items: Order["items"]) {
  if (!items || items.length === 0)
    return "<tr><td colspan=3 style='padding:8px;'>No items</td></tr>";
  return items
    .map(
      (it) =>
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

function confirmationHtml(order: Order) {
  const itemsHtml = renderItemsHtml(order.items || []);
  const VERIFY_BASE_URL =
    process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#111;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e9e9e9;border-radius:8px;overflow:hidden;">
      <div style="background:#0b6;padding:18px 24px;color:#fff;display:flex;align-items:center;gap:12px;">
        <div style="font-weight:700;font-size:18px">KicksHub</div>
        <div style="margin-left:auto;font-size:12px;opacity:.95">Payment Confirmed</div>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hi ${escapeHtml(
          order.customerName || order.email
        )},</p>
        <p style="margin:0 0 18px;">Your payment for order <strong>${escapeHtml(
          order.id
        )}</strong> has been received. We've started processing it and will send updates when it ships.</p>

        <div style="background:#e6f9f0;border:1px solid #0b6;border-radius:6px;padding:12px;margin:0 0 18px;">
          <p style="margin:0;color:#0a5;font-weight:600;">✓ Payment successful via card</p>
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

        <p style="margin:18px 0 0;font-size:13px;color:#666">View your order: <a href="${VERIFY_BASE_URL}/orders/${encodeURIComponent(
    order.id
  )}">${VERIFY_BASE_URL}/orders/${encodeURIComponent(order.id)}</a></p>
      </div>
      <div style="background:#fafafa;padding:12px 20px;font-size:12px;color:#777;text-align:center">Thanks for shopping with KicksHub.</div>
    </div>
  </div>
  `;
}

async function sendConfirmationEmail(order: Order) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: order.email,
    subject: `Payment confirmed — ${order.id}`,
    html: confirmationHtml(order),
    text: `Your payment for order ${order.id} is confirmed. Total ${order.total}`,
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    console.error("No stripe-signature header");
    return NextResponse.json(
      { error: "No stripe-signature header" },
      { status: 400 }
    );
  }

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;

  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("No orderId in session metadata");
        break;
      }

      // A completed session may still be awaiting an asynchronous payment.
      if (session.payment_status !== "paid") break;

      console.log(`Payment successful for order: ${orderId}`);

      try {
        const existing = await getOrderById(orderId);
        if (!existing) throw new Error("ORDER_NOT_FOUND");
        // Sequential webhook retries must not reset shipped orders or resend mail.
        if (existing.paymentStatus === "paid") break;
        // Update order status to confirmed
        await updateOrderById(orderId, { status: "confirmed", paymentStatus: "paid" });

        // Get the full order details to send email
        const order = await getOrderById(orderId);

        if (order && order.email) {
          // Send confirmation email
          await sendConfirmationEmail(order);
          console.log(`Confirmation email sent for order: ${orderId}`);
        }
      } catch (error) {
        console.error(`Error processing payment for order ${orderId}:`, error);
        return NextResponse.json({ error: "Payment processing unavailable" }, { status: 503 });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        console.log(`Checkout session expired for order: ${orderId}`);
        // Update order status to cancelled
        try {
          const order = await getOrderById(orderId);
          if (!order) throw new Error("ORDER_NOT_FOUND");
          if (order.paymentStatus === "paid") break;
          await updateOrderById(orderId, { status: "cancelled", paymentStatus: "failed" });
        } catch (error) {
          console.error(`Error cancelling order ${orderId}:`, error);
          return NextResponse.json({ error: "Payment processing unavailable" }, { status: 503 });
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log(`Payment failed: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
