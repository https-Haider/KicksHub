"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProductSlug } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { CartButton } from "@/components/cart-button";
import Image from "next/image";
import { ProductImageGallery } from "@/components/product-image-gallery";

export default function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadRelated = async () => {
      if (!product) return;
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const list = await res.json();
        if (!mounted) return;
        const related = (list || [])
          .filter(
            (p: any) => p.category === product.category && p.id !== product.id
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (e) {
        // ignore
      }
    };
    loadRelated();
    return () => {
      mounted = false;
    };
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const router = useRouter();

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      // navigate straight to checkout (cart will contain this item)
      router.push("/checkout");
    }
  };

  if (!product) return null;

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/placeholder-logo.png"
                alt="KicksHub"
                className="h-10 md:h-14 w-auto"
              />
              <div className="text-2xl font-bold text-primary">Kicks Hub</div>
            </Link>
            <div className="flex items-center gap-4">
              <CartButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Products
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-foreground font-medium" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Product Image Gallery */}
          <div className="flex items-start justify-center">
            <div className="w-full">
              <ProductImageGallery
                mainImage={product.image}
                images={product.images}
                productName={product.name}
                category={product.category}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                {product.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
            </div>

            <div className="border-t border-b border-border py-6">
              <div className="text-4xl font-bold text-primary mb-2">
                PKR {product.price}
              </div>
              <p className="text-muted-foreground">SKU: {product.sku}</p>
            </div>

            <div>
              <h2 className="font-semibold text-foreground mb-3">
                Description
              </h2>
              <div
                className="text-muted-foreground leading-relaxed product-description-html"
                dangerouslySetInnerHTML={{ __html: product.description || "" }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    id="quantity"
                    className="text-lg font-semibold text-foreground w-8 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                aria-live="polite"
              >
                {addedToCart
                  ? "Added to Cart!"
                  : product.inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium text-foreground">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium text-foreground">
                    Free on orders over PKR 5000
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Returns:</span>
                  <span className="font-medium text-foreground">
                    30-day guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-border pt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Related Products
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${getProductSlug(relatedProduct)}`}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name || "Related product"}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="mt-auto">
                        <span className="text-xl font-bold text-primary">
                          PKR {relatedProduct.price}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
