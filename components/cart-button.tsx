"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        <span>Cart ({itemCount})</span>
      </Button>
    </Link>
  );
}
