"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductSlug } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartButton } from "@/components/cart-button";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "price-low" | "price-high" | "rating" | "newest"
  >("newest");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Derive categories from actual products + standard ones
  const standardCategories = ["Running", "Casual", "Basketball"];
  const categories = useMemo(() => {
    const productCategories = new Set<string>(standardCategories);
    products.forEach((p) => {
      if (p.category) productCategories.add(p.category);
    });
    return Array.from(productCategories).sort();
  }, [products]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // Keep all products in the All Products listing (include shoes).
        setProducts(data);
      } catch (e) {
        console.error("Error fetching /api/products", e);
        if (e instanceof Error) setFetchError(e.message);
        else setFetchError(String(e));
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    const list = products || [];
    const filtered = selectedCategory
      ? list.filter((p) => p.category === selectedCategory)
      : list;

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
        default:
          return b.id - a.id;
      }
    });
  }, [selectedCategory, sortBy, products]);

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/placeholder-logo.png"
                alt="KicksHub"
                width={56}
                height={56}
                priority
                className="h-10 md:h-14 w-auto"
              />
              <div className="text-2xl font-bold text-primary">Kicks Hub</div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/products"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Shop
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <CartButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="border-b border-border bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            All Products
          </h1>
          <p className="text-muted-foreground">
            Browse our complete collection of vintage and thrifted sneakers
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Sidebar Filters */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === null
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {filteredAndSortedProducts.length} products
            </div>
            {fetchError && (
              <div className="mb-4 text-sm text-destructive">
                Error loading products: {fetchError}
              </div>
            )}
            {!loading && products.length === 0 && !fetchError && (
              <div className="mb-4 text-sm text-muted-foreground">
                No products available.
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${getProductSlug(product)}`}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer h-full flex flex-col">
                    <div className="relative h-64 overflow-hidden bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {/* description removed from product grid to avoid showing raw HTML; keep listing compact */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {product.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({product.reviews})
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          PKR {product.price}
                        </span>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
