import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products.server";

/*
Optionally, if your products.server exports a Product type, you can import it instead:
import type { Product as ServerProduct } from "@/lib/products.server";
then use: const products: ServerProduct[] = await getAllProducts();
*/

// Local Product type that accepts numeric ids too (fixes the TS complaint)
type Product = {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  name?: string;
  // add other fields you need
};

export async function GET() {
  try {
    // If getAllProducts is typed in your lib, you can also do:
    // const products = (await getAllProducts()) as Product[];
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
      // pick first available identifier
      const rawSlug = p.id ?? p._id ?? p.slug ?? p.name;
      if (rawSlug === undefined || rawSlug === null) continue;

      // coerce to string (handles numeric ids) and encode
      const slug = encodeURIComponent(String(rawSlug));
      urls.push(`${baseUrl}/products/${slug}`);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    console.error("sitemap error:", err);
    return new NextResponse("Sitemap generation failed", { status: 500 });
  }
}
