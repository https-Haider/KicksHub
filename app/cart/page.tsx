"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { Spinner } from "@/components/ui/spinner";
import { CartButton } from "@/components/cart-button";
import { getProductSlug } from "@/lib/products";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart, isLoading } =
    useCart();
  // use PKR shipping rules: free over PKR 5000, otherwise PKR 200
  const shippingCost = total > 5000 ? 0 : 200;
  const grandTotal = Math.round(total + shippingCost);

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">Store</div>
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
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">Review and manage your items</p>
        </div>
      </section>

      {/* Cart Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <Spinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading cart…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Start shopping to add items to your cart
            </p>
            <Link href="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="divide-y divide-border">
                  {items.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize || index}`}
                      className="p-6 flex gap-6"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <Link
                          href={`/products/${getProductSlug(item.product)}`}
                        >
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.product.category}
                        </p>
                        {item.selectedSize && (
                          <p className="text-sm text-muted-foreground mb-3">
                            Size:{" "}
                            <span className="font-medium text-foreground">
                              EU {item.selectedSize}
                            </span>
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            PKR {Math.round(item.product.price)}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border border-border rounded-md">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                    item.selectedSize
                                  )
                                }
                                className="px-3 py-1 hover:bg-muted transition-colors"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                    item.selectedSize
                                  )
                                }
                                className="px-3 py-1 hover:bg-muted transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.selectedSize)
                              }
                              className="text-sm text-destructive hover:text-destructive/80 transition-colors font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          PKR {Math.round(item.product.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="mt-6 flex gap-4">
                <Link href="/products" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1 bg-transparent"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>PKR {Math.round(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? "Free" : `PKR ${shippingCost}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    PKR {grandTotal}
                  </span>
                </div>

                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free shipping on orders over PKR 5000
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
