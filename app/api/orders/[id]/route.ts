// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders.server";
import { updateOrderById } from "@/lib/orders.server";
import {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "@/lib/email.server";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Context) {
  try {
    const params = await Promise.resolve(ctx.params);
    const id = params.id;
    if (!id)
      return NextResponse.json({ error: "order id required" }, { status: 400 });

    const order = await getOrderById(id);
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json(order);
  } catch (err: unknown) {
    console.error(
      "GET /api/orders/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const params = await Promise.resolve(ctx.params);
    const id = params.id;
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
    } catch (emailErr: unknown) {
      console.error(
        "Failed to send status update email:",
        emailErr instanceof Error ? emailErr.message : emailErr
      );
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error(
      "PATCH /api/orders/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
