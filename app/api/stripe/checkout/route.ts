import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { getOrderById } from "@/lib/orders.server";

export async function POST(req: Request) {
  try {
    const stripe = await getStripe();
    const body = await req.json();
    const { orderId } = body;
    const order = await getOrderById(orderId);
    if (!order || order.paymentMethod !== "stripe" || order.status !== "pending_payment") {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }
    const items = order.items;

    // Get base URL from env or construct from request headers
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

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
    const shippingCost = order.shipping;

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
      success_url: `${baseUrl}/order-success/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      customer_email: order.email,
      metadata: {
        orderId: orderId,
        customerName: order.customerName,
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
