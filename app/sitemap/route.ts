import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products.server";

/** Product type accepts number or string ids to avoid type mismatch */
type Product = {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  name?: string;
};

export async function GET() {
  try {
    const products: Product[] = await getAllProducts();

    const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

    const urls: string[] = [
      `${baseUrl}/`,
      `${baseUrl}/products`,
      `${baseUrl}/cart`,
      `${baseUrl}/checkout`,
    ];

    for (const p of products || []) {
      if (!p) continue;
      const rawSlug = p.id ?? p._id ?? p.slug ?? p.name;
      if (rawSlug === undefined || rawSlug === null) continue;
      const slug = encodeURIComponent(String(rawSlug));
      urls.push(`${baseUrl}/products/${slug}`);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (err) {
    console.error("sitemap error:", err);
    return new NextResponse("Sitemap generation failed", { status: 500 });
  }
}
