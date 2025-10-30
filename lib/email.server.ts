import nodemailer from "nodemailer";

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
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(n: number) {
  return `PKR ${Math.round(n)}`;
}

function itemsHtml(items: any[]) {
  if (!items || items.length === 0)
    return "<tr><td colspan=3 style='padding:8px;'>No items</td></tr>";
  return items
    .map(
      (it: any) =>
        `<tr><td style='padding:8px;border-bottom:1px solid #eee;'>${escapeHtml(
          it.productName
        )} (ID: ${escapeHtml(
          it.productId
        )})</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>x${
          it.quantity
        }</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:right;'>${formatMoney(
          it.price * it.quantity
        )}</td></tr>`
    )
    .join("");
}

export async function sendOrderShippedEmail(order: any) {
  try {
    const transporter = createTransporter();
    const items = itemsHtml(order.items || []);
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#111;">
        <div style="max-width:600px;margin:0 auto;border:1px solid #e9e9e9;border-radius:8px;overflow:hidden;">
          <div style="background:#0b6;padding:18px 24px;color:#fff;display:flex;align-items:center;gap:12px;">
            <div style="font-weight:700;font-size:18px">KicksHub</div>
            <div style="margin-left:auto;font-size:12px;opacity:.95">Shipped</div>
          </div>
          <div style="padding:20px;">
            <p>Hi ${escapeHtml(order.customerName || order.email)},</p>
            <p>Your order <strong>${escapeHtml(
              order.id
            )}</strong> has been shipped.</p>
            <p><strong>Carrier:</strong> ${escapeHtml(
              order.carrier
            )} • <strong>Tracking #:</strong> ${escapeHtml(
      order.trackingNumber
    )}</p>
            <h4>Order summary</h4>
            <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">Item</th>
                  <th style="text-align:center;padding:8px;border-bottom:1px solid #eee">Qty</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid #eee">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items}
              </tbody>
            </table>
            <div style="display:flex;justify-content:space-between;font-weight:600;padding-top:8px;border-top:1px solid #eee"> 
              <div>Total</div>
              <div>${formatMoney(order.total || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: order.email,
      subject: `Your order ${order.id} has shipped`,
      html,
      text: `Your order ${order.id} has shipped. Carrier: ${order.carrier} Tracking: ${order.trackingNumber}`,
    });
  } catch (err) {
    console.error("sendOrderShippedEmail error:", err);
  }
}

export async function sendOrderDeliveredEmail(order: any) {
  try {
    const transporter = createTransporter();
    const itemsList = (order.items || [])
      .map(
        (it: any) =>
          `${escapeHtml(it.productName)} (ID: ${escapeHtml(it.productId)})`
      )
      .join(", ");
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#111;">
        <div style="max-width:600px;margin:0 auto;border:1px solid #e9e9e9;border-radius:8px;overflow:hidden;">
          <div style="background:#0b6;padding:18px 24px;color:#fff;display:flex;align-items:center;gap:12px;">
            <div style="font-weight:700;font-size:18px">KicksHub</div>
            <div style="margin-left:auto;font-size:12px;opacity:.95">Delivered</div>
          </div>
          <div style="padding:20px;">
            <p>Hi ${escapeHtml(order.customerName || order.email)},</p>
            <p>Your order <strong>${escapeHtml(
              order.id
            )}</strong> has been delivered successfully.</p>
            <p>Delivered items: ${itemsList}</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: order.email,
      subject: `Your order ${order.id} has been delivered`,
      html,
      text: `Your order ${order.id} has been delivered. Items: ${itemsList}`,
    });
  } catch (err) {
    console.error("sendOrderDeliveredEmail error:", err);
  }
}

export default { sendOrderShippedEmail, sendOrderDeliveredEmail };
