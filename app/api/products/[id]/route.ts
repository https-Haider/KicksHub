import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products.server";
import { updateProduct, deleteProduct } from "@/lib/products.server";

export async function GET(req: Request, ctx: { params: any }) {
  try {
    const params = ctx?.params;
    const resolvedParams =
      params && typeof (params as any)?.then === "function"
        ? await params
        : params;
    const id = Number(resolvedParams?.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const p = await getProductById(id);
    if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(p);
  } catch (err: any) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: any }) {
  try {
    const params = ctx?.params;
    const resolvedParams =
      params && typeof (params as any)?.then === "function"
        ? await params
        : params;
    const id = Number(resolvedParams?.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const body = await req.json();
    const updated = await updateProduct(id, body || {});
    if (!updated)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/products/[id] error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: any }) {
  try {
    const params = ctx?.params;
    const resolvedParams =
      params && typeof (params as any)?.then === "function"
        ? await params
        : params;
    const id = Number(resolvedParams?.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const ok = await deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
