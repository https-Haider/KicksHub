import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products.server";

export async function GET() {
  try {
    const products = await getAllProducts();
    const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";

    const urls = [
      `${baseUrl}/`,
      `${baseUrl}/products`,
      `${baseUrl}/cart`,
      `${baseUrl}/checkout`,
    ];

    for (const p of products || []) {
      const slug = p.id || p._id || p.slug || p.name;
      if (!slug) continue;
      urls.push(
        `${baseUrl}/products/${encodeURIComponent(p.id ?? p._id ?? p.slug)}`
      );
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls
          .map((url) => {
            return `<url><loc>${url}</loc></url>`;
          })
          .join("\n")}
      </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    console.error("sitemap error", err);
    return new NextResponse("", { status: 500 });
  }
}
