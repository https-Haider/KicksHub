import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products.server";
import { updateProduct, deleteProduct } from "@/lib/products.server";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Context) {
  try {
    const params = await Promise.resolve(ctx.params);
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const p = await getProductById(id);
    if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(p);
  } catch (err: unknown) {
    console.error(
      "GET /api/products/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const params = await Promise.resolve(ctx.params);
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const body = await req.json();
    const updated = await updateProduct(id, body || {});
    if (!updated)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error(
      "PATCH /api/products/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const params = await Promise.resolve(ctx.params);
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
    const ok = await deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(
      "DELETE /api/products/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
