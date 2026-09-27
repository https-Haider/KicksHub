import { describe, expect, it } from "vitest";
import { getProductSlug, slugify } from "./products";
describe("product URLs", () => {
  it("prefers persisted slugs", () => expect(getProductSlug({id:7,name:"Changed",slug:"stable-slug"})).toBe("stable-slug"));
  it("creates deterministic fallback slugs", () => expect(slugify("Nike Blazer Mid 77")).toBe("nike-blazer-mid-77"));
});
