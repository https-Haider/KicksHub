import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products.server";
import { ProductCatalogue } from "@/components/product-catalogue";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Shop Thrifted Sneakers", description: "Browse active KicksHub sneakers by size, condition, category and price.", alternates: { canonical: "/products" } };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  try {
    const products = await getAllProducts();
    return <main className="min-h-screen bg-background"><SiteHeader /><Suspense fallback={<p className="px-4 py-20 text-center">Loading products…</p>}><ProductCatalogue initialProducts={products} /></Suspense><SiteFooter /></main>;
  } catch (error) {
    console.error("Products page failed to load", error);
    return <main className="min-h-screen bg-background"><SiteHeader /><section className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl font-bold">We couldn’t load the shop</h1><p className="mt-3 text-muted-foreground">Please refresh the page or try again shortly.</p></section><SiteFooter /></main>;
  }
}
