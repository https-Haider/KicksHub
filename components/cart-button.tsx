"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" aria-label={`Cart with ${itemCount} items`}>
      <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-black/15 bg-transparent shadow-none hover:bg-ink hover:text-cream">
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Cart</span><span className="grid size-5 place-items-center rounded-full bg-rust text-[10px] text-white">{itemCount}</span>
      </Button>
    </Link>
  );
}
