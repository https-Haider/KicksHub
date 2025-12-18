import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const stripe = await getStripe();
    const body = await req.json();
    const { items, customerInfo, orderId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Create line items for Stripe
    // Note: For PKR, Stripe uses paisa as the smallest unit (1 PKR = 100 paisa)
    // So we need to multiply PKR amounts by 100
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "pkr",
        product_data: {
          name: item.productName,
          description: item.selectedSize
            ? `Size: ${item.selectedSize}`
            : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert PKR to paisa (smallest unit)
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = subtotal > 5000 ? 0 : 200;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "pkr",
          product_data: {
            name: "Shipping",
            description: "Standard delivery",
          },
          unit_amount: shippingCost * 100, // Convert PKR to paisa
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/order-success/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/checkout?canceled=true`,
      customer_email: customerInfo?.email,
      metadata: {
        orderId: orderId,
        customerName: customerInfo?.customerName,
        phone: customerInfo?.phone,
        address: customerInfo?.address,
        city: customerInfo?.city,
        state: customerInfo?.state,
        zipCode: customerInfo?.zipCode,
      },
      shipping_address_collection: {
        allowed_countries: ["PK"],
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
