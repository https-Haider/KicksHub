import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products.server";
import { getProductSlug } from "@/lib/products";
import { ImageIcon } from "lucide-react";
import { CartButton } from "@/components/cart-button";
import { LandingReviewsWrapper } from "@/components/landing-reviews-wrapper";

export default async function Home() {
  // Fetch products server-side for the featured section
  let all: any[] = [];
  try {
    all = await getAllProducts();
  } catch (e) {
    // ignore — fall back to empty list
    all = [];
  }

  // Show first 4 products as featured (all categories are shoes/sneakers)
  const featuredProducts = (all || []).slice(0, 4);

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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/placeholder-logo.png"
                  alt="KicksHub"
                  width={56}
                  height={56}
                  priority
                  className="h-10 md:h-14 w-auto"
                />
                <h1 className="text-2xl font-bold text-primary">KicksHub</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/products"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
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

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32"
        aria-label="Hero section"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
                Discover Vintage & Thrifted Shoes
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Curated collection of authentic vintage and thrifted sneakers.
                From classic Jordans to retro Nikes, find your perfect pair.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Now
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-96 md:h-full min-h-[400px] rounded-lg overflow-hidden bg-muted">
              <Image
                src="/shoes/hero-shoes.jpg"
                alt="Collection of vintage thrifted sneakers including Air Jordans and Nike shoes"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        className="py-20 md:py-32 bg-background"
        aria-label="Featured sneakers"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Featured Sneakers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked vintage and thrifted shoes that our customers love.
              Authentic, quality, and timeless.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => {
              const totalImages =
                (product.image ? 1 : 0) + (product.images?.length || 0);
              return (
                <Link
                  key={product.id}
                  href={`/products/${getProductSlug(product)}`}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                    <div className="relative h-64 overflow-hidden bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name || "Product image"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={index === 0}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {totalImages > 1 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                          <ImageIcon className="w-3 h-3" />
                          <span>{totalImages}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
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
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-background" aria-label="Why choose us">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5K+</div>
              <p className="text-muted-foreground">Happy Sneaker Collectors</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">
                Authentic Shoes Guaranteed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <LandingReviewsWrapper />

      {/* Footer */}
      <footer
        className="border-t border-border bg-background py-12"
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Follow</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Facebook
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 KicksHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
