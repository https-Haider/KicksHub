// Lazy initialize Stripe to avoid build-time errors when env var is not set
let stripeInstance: any = null;

export async function getStripe() {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    if (process.env.NODE_ENV !== "production" && !secretKey.startsWith("sk_test_")) {
      throw new Error("Only a Stripe test-mode key may be used outside production");
    }
    // Dynamic import to prevent build-time initialization
    const Stripe = (await import("stripe")).default;
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
}

export default getStripe;
