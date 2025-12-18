import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id: orderId } = await params;
  const { session_id: sessionId } = await searchParams;

  // If we have a session_id, this was a Stripe payment
  const isPaidWithStripe = !!sessionId;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          {isPaidWithStripe
            ? "Payment Successful!"
            : "Thank you for your order!"}
        </h1>

        <p className="mb-6 text-muted-foreground">
          Your order{" "}
          <span className="font-mono font-semibold text-foreground">
            {orderId}
          </span>{" "}
          has been
          {isPaidWithStripe ? " paid and" : ""} confirmed.
        </p>

        {isPaidWithStripe && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-700 dark:text-green-300 text-sm">
              ✓ Payment received successfully via card
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <Link href="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          A confirmation email has been sent to you. Contact support if you have
          any questions.
        </p>
      </div>
    </main>
  );
}
