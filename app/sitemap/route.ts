import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products.server";
import { renderSitemap } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllProducts();
    return new NextResponse(renderSitemap(products), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("sitemap error:", error);
    // Don't cache a partial sitemap if inventory is temporarily unavailable.
    return new NextResponse("Sitemap generation failed", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }
}
