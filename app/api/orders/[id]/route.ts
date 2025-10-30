// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders.server";
import { updateOrderById } from "@/lib/orders.server";
import {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "@/lib/email.server";

export async function GET(req: Request, ctx: { params: any }) {
  try {
    // In some Next.js versions `params` can be a Promise — unwrap if needed.
    const params = ctx?.params;
    const resolvedParams =
      params && typeof (params as any)?.then === "function"
        ? await params
        : params;
    const id = resolvedParams?.id;
    if (!id)
      return NextResponse.json({ error: "order id required" }, { status: 400 });

    const order = await getOrderById(id);
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: { params: any }) {
  try {
    const params = ctx?.params;
    const resolvedParams =
      params && typeof (params as any)?.then === "function"
        ? await params
        : params;
    const id = resolvedParams?.id;
    if (!id)
      return NextResponse.json({ error: "order id required" }, { status: 400 });

    const body = await req.json();
    // Only allow admin to set one of these three canonical statuses
    const allowed = ["confirmed", "shipped", "delivered"];
    if (!body || (body.status && !allowed.includes(body.status))) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    // Prevent moving status backwards (only allow progression)
    const existing = await getOrderById(id);
    if (!existing)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const orderIndex = allowed.indexOf(existing.status);
    const newIndex = body.status ? allowed.indexOf(body.status) : orderIndex;
    if (newIndex < orderIndex) {
      return NextResponse.json(
        { error: "cannot move status backwards" },
        { status: 400 }
      );
    }

    // If marking as shipped, require trackingNumber and carrier
    if (body.status === "shipped") {
      if (!body.trackingNumber || !body.carrier) {
        return NextResponse.json(
          { error: "trackingNumber and carrier required when shipping" },
          { status: 400 }
        );
      }
    }

    const updated = await updateOrderById(id, body);
    if (!updated)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If status progressed to shipped/delivered, send notification emails (best-effort)
    try {
      if (existing.status !== updated.status) {
        if (updated.status === "shipped") {
          // updated should contain carrier/trackingNumber
          await sendOrderShippedEmail(updated);
        } else if (updated.status === "delivered") {
          await sendOrderDeliveredEmail(updated);
        }
      }
    } catch (err) {
      console.error("Failed to send status update email:", err);
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
