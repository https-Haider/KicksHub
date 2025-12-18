import Stripe from "stripe";

// Lazy initialize Stripe to avoid build-time errors when env var is not set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-04-30.basil",
    });
  }
  return stripeInstance;
}

export default getStripe;
