import { absoluteUrl } from "./seo";

type SitemapProduct = {
  id: number;
  slug?: string;
  updatedAt?: string | Date;
  isActive?: boolean;
  published?: boolean;
};

type SitemapEntry = { loc: string; lastmod?: string; changefreq: string; priority: number };

export function buildSitemapEntries(products: SitemapProduct[]): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    { loc: absoluteUrl("/"), changefreq: "daily", priority: 1 },
    { loc: absoluteUrl("/products"), changefreq: "daily", priority: 0.9 },
    { loc: absoluteUrl("/about"), changefreq: "monthly", priority: 0.7 },
    { loc: absoluteUrl("/contact"), changefreq: "monthly", priority: 0.7 },
    ...["privacy", "terms", "shipping", "returns"].map(policy => ({
      loc: absoluteUrl(`/policies/${policy}`), changefreq: "monthly", priority: 0.3,
    })),
  ];
  const seen = new Set(entries.map(entry => entry.loc));
  for (const product of products) {
    if (product.isActive === false || product.published === false) continue;
    const loc = absoluteUrl(`/products/${encodeURIComponent(product.slug || String(product.id))}`);
    if (seen.has(loc)) continue;
    seen.add(loc);
    const updatedAt = product.updatedAt ? new Date(product.updatedAt) : null;
    entries.push({
      loc,
      ...(updatedAt && Number.isFinite(updatedAt.getTime()) ? { lastmod: updatedAt.toISOString() } : {}),
      changefreq: "weekly",
      priority: 0.8,
    });
  }
  return entries;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function renderSitemap(products: SitemapProduct[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${buildSitemapEntries(products).map(entry => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}
