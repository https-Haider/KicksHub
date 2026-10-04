import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kickshub_admin";
export const SESSION_MAX_AGE = 8 * 60 * 60;

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(password), hash(expected));
}

export function createAdminSession(now = Date.now()): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Admin authentication is not configured");
  const payload = `${now + SESSION_MAX_AGE * 1000}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function verifyAdminSession(token: string, now = Date.now()): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const [expires, nonce, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d+$/.test(expires || "") || !/^[a-f0-9]{32}$/.test(nonce || "") || !/^[a-f0-9]{64}$/.test(signature || "")) return false;
  if (Number(expires) <= now || Number(expires) > now + SESSION_MAX_AGE * 1000) return false;
  const expected = createHmac("sha256", secret).update(`${expires}.${nonce}`).digest();
  return timingSafeEqual(Buffer.from(signature, "hex"), expected);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value || "");
}
