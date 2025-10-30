import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = params.id;
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
        <p className="mb-6 text-muted-foreground">
          Your order <span className="font-mono">{orderId}</span> has been
          confirmed and a confirmation email was sent to you.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/products">
            <Button size="lg">Order again</Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          You can view your order details from your account or contact support
          if you have any questions.
        </p>
      </div>
    </main>
  );
}
