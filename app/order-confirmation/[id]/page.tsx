"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartButton } from "@/components/cart-button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/orders";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  // OTP removed: orders are confirmed immediately on create

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          setOrder(null);
        } else {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) load();
  }, [orderId]);

  // no OTP flow: nothing to do here

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        {/* same "order not found" UI as before */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Order not found
            </h1>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* navigation omitted for brevity - keep same as you had */}
      {/* ... */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* success message */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            A confirmation has been sent to{" "}
            <span className="font-semibold">{order.email}</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/products")}
          >
            Continue Shopping
          </Button>
        </div>

        {/* rest of order UI (items, summary) — keep your existing cards */}
        {/* ... keep the rest of your existing JSX for order details here unchanged ... */}
      </div>
    </main>
  );
}
