"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export function CartButton() {
  const { itemCount } = useCart()

  return (
    <Link href="/cart">
      <Button variant="outline" size="sm">
        Cart ({itemCount})
      </Button>
    </Link>
  )
}
