import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rateLimit: vi.fn(), authenticated: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkMongoRateLimit: mocks.rateLimit }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
import { POST, GET, DELETE } from "./route";

function request(password: string, origin = "https://www.kickshub.site") {
  return new Request("https://www.kickshub.site/api/admin/session", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ password }),
  });
}
beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD", "test-only-password");
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue({ allowed: true });
});
afterEach(() => vi.unstubAllEnvs());

describe("admin session endpoint", () => {
  it("sets an HTTP-only cookie after server password verification", async () => {
    const response = await POST(request("test-only-password"));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=strict");
    expect(response.headers.get("set-cookie")).not.toContain("test-only-password");
  });
  it("rejects incorrect passwords without issuing cookies", async () => {
    const response = await POST(request("wrong"));
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
  it("rejects cross-origin login and logout", async () => {
    expect((await POST(request("test-only-password", "https://other.example"))).status).toBe(403);
    expect((await DELETE(request("", "https://other.example"))).status).toBe(403);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
  });
  it("enforces the login rate limit", async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false });
    expect((await POST(request("test-only-password"))).status).toBe(429);
  });
  it("fails closed when server auth is unconfigured or rate limiting is unavailable", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect((await POST(request("anything"))).status).toBe(503);
    vi.stubEnv("ADMIN_PASSWORD", "test-only-password");
    mocks.rateLimit.mockRejectedValue(new Error("database unavailable"));
    expect((await POST(request("test-only-password"))).status).toBe(503);
  });
  it("does not restore authentication from a client-side flag and clears cookies on logout", async () => {
    const status = await GET();
    expect(await status.json()).toEqual({ authenticated: false });
    expect(status.headers.get("cache-control")).toBe("no-store");
    const response = await DELETE(request(""));
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
