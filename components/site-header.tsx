import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/components/cart-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/placeholder-logo.png" alt="KicksHub" width={56} height={56} priority className="h-10 w-auto md:h-14" />
          <span className="text-2xl font-bold text-primary">KicksHub</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/products" className="text-sm font-medium hover:text-primary">Shop</Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">About</Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">Contact</Link>
        </div>
        <CartButton />
      </nav>
    </header>
  );
}
