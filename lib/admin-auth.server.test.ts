import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSession, verifyAdminPassword, verifyAdminSession, SESSION_MAX_AGE } from "./admin-auth.server";

beforeEach(() => vi.stubEnv("ADMIN_PASSWORD", "test-only-password"));
afterEach(() => vi.unstubAllEnvs());

describe("server admin authentication", () => {
  it("validates passwords against the server environment", () => {
    expect(verifyAdminPassword("test-only-password")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
  });
  it("accepts signed sessions until their expiry", () => {
    const token = createAdminSession(1000);
    expect(verifyAdminSession(token, 2000)).toBe(true);
    expect(verifyAdminSession(token, 1000 + SESSION_MAX_AGE * 1000)).toBe(false);
  });
  it("rejects forged, malformed and password-rotated sessions", () => {
    const token = createAdminSession(1000);
    expect(verifyAdminSession(token.replace(/^\d+/, "99999999"), 2000)).toBe(false);
    expect(verifyAdminSession("true", 2000)).toBe(false);
    vi.stubEnv("ADMIN_PASSWORD", "different-test-password");
    expect(verifyAdminSession(token, 2000)).toBe(false);
  });
  it("fails closed when no server password is configured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(verifyAdminPassword("anything")).toBe(false);
    expect(verifyAdminSession("anything")).toBe(false);
    expect(() => createAdminSession()).toThrow("not configured");
  });
});
