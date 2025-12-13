import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products.server";

/** Product type accepts number or string ids to avoid type mismatch */
type Product = {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  name?: string;
  updatedAt?: string | Date;
};

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

export async function GET() {
  try {
    const products: Product[] = await getAllProducts();
    const baseUrl = process.env.SITE_URL ?? "https://www.kickshub.site";
    const today = new Date().toISOString().split("T")[0];

    const staticUrls: SitemapUrl[] = [
      {
        loc: `${baseUrl}/`,
        lastmod: today,
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${baseUrl}/products`,
        lastmod: today,
        changefreq: "daily",
        priority: 0.9,
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: today,
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/contact`,
        lastmod: today,
        changefreq: "monthly",
        priority: 0.7,
      },
    ];

    const productUrls: SitemapUrl[] = [];
    for (const p of products || []) {
      if (!p) continue;
      // Prefer slug, then id, then name
      const rawSlug = p.slug ?? p.id ?? p._id ?? p.name;
      if (rawSlug === undefined || rawSlug === null) continue;
      const slug = encodeURIComponent(String(rawSlug));
      const lastmod = p.updatedAt
        ? new Date(p.updatedAt).toISOString().split("T")[0]
        : today;
      productUrls.push({
        loc: `${baseUrl}/products/${slug}`,
        lastmod,
        changefreq: "weekly",
        priority: 0.8,
      });
    }

    const allUrls = [...staticUrls, ...productUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("sitemap error:", err);
    return new NextResponse("Sitemap generation failed", { status: 500 });
  }
}
