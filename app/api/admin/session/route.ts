import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_MAX_AGE, createAdminSession, isAdminAuthenticated, verifyAdminPassword } from "@/lib/admin-auth.server";
import { checkMongoRateLimit } from "@/lib/rate-limit";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  try {
    const limit = await checkMongoRateLimit({
      userId: `admin-login:${req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"}`,
      endpoint: "admin-login", limit: 10, windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    const { password } = await req.json();
    if (typeof password !== "string" || !verifyAdminPassword(password)) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login unavailable. Try again later." }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
