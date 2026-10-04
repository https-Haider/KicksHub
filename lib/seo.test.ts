import { describe, expect, it } from "vitest";
import { pageMetadata, serializeJsonLd, absoluteUrl } from "./seo";
import { buildSitemapEntries, renderSitemap } from "./sitemap";
import robots from "../app/robots";

describe("SEO regressions", () => {
  it("keeps each page's canonical and social URL aligned", () => {
    const metadata = pageMetadata("Contact", "Ask about a pair", "/contact");
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/contact"));
    expect(metadata.openGraph).toMatchObject({ url: absoluteUrl("/contact") });
    expect(metadata.twitter).toMatchObject({ images: [absoluteUrl("/editorial/thrifted-sneaker-wall.jpg")] });
  });
  it("prevents product content from closing JSON-LD script tags", () => {
    const content = { name: '</script><script>alert("test")</script>' };
    const serialized = serializeJsonLd(content);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(content);
  });
  it("lists only published products with encoded, unique canonical URLs", () => {
    const entries = buildSitemapEntries([
      { id: 1, slug: "pair & one" }, { id: 1, slug: "pair & one" },
      { id: 2, published: false }, { id: 3, isActive: false }, { id: 4 },
    ]);
    expect(entries.filter(entry => entry.loc.includes("/products/"))).toEqual([
      expect.objectContaining({ loc: absoluteUrl("/products/pair%20%26%20one") }),
      expect.objectContaining({ loc: absoluteUrl("/products/4") }),
    ]);
  });
  it("omits unknown or invalid update dates instead of inventing freshness", () => {
    const entries = buildSitemapEntries([{ id: 1 }, { id: 2, updatedAt: "invalid" }, { id: 3, updatedAt: "2026-09-26" }]);
    expect(entries.find(entry => entry.loc.endsWith("/1"))).not.toHaveProperty("lastmod");
    expect(entries.find(entry => entry.loc.endsWith("/2"))).not.toHaveProperty("lastmod");
    expect(entries.find(entry => entry.loc.endsWith("/3"))?.lastmod).toBe("2026-09-26T00:00:00.000Z");
    expect(renderSitemap([{ id: 2, updatedAt: "invalid" }])).not.toContain("Invalid Date");
  });
  it("includes policy pages and uses one consistent crawler rule group", () => {
    expect(buildSitemapEntries([]).some(entry => entry.loc.endsWith("/policies/shipping"))).toBe(true);
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: expect.arrayContaining(["/checkout", "/cart", "/verify/"]) });
  });
});
