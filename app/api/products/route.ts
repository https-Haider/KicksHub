import { NextResponse } from "next/server";
import { getAllProducts, addProduct } from "@/lib/products.server";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (err: unknown) {
    console.error(
      "GET /api/products error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // minimal validation
    if (!body || !body.name || !body.price) {
      return NextResponse.json(
        { error: "name and price required" },
        { status: 400 }
      );
    }
    const product = await addProduct(body);
    return NextResponse.json(product);
  } catch (err: unknown) {
    console.error(
      "POST /api/products error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
