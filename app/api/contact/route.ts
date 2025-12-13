import { NextResponse } from "next/server";
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

function escapeHtml(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Form Message</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0;">${escapeHtml(name.trim())}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0;">
                <a href="mailto:${escapeHtml(
                  email.trim()
                )}" style="color: #667eea;">${escapeHtml(email.trim())}</a>
              </td>
            </tr>
            ${
              phone
                ? `<tr>
              <td style="padding: 10px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0;">
                <a href="tel:${escapeHtml(
                  phone.trim()
                )}" style="color: #667eea;">${escapeHtml(phone.trim())}</a>
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px 0; font-weight: bold;">Subject:</td>
              <td style="padding: 10px 0;">${escapeHtml(subject.trim())}</td>
            </tr>
          </table>
          
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 20px;">Message</h2>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(
              message.trim()
            )}</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">This message was sent from the KicksHub contact form.</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: "thriftshoes.boss@gmail.com",
      replyTo: email.trim(),
      subject: `[KicksHub Contact] ${subject.trim()}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/contact error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
