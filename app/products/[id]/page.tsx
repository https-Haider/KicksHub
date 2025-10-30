import type { Metadata } from "next";
import { getProductById } from "@/lib/products.server";
import ProductDetailClient from "@/components/product-detail-client";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = (await params) as { id?: string };
  if (!id) return {};
  const idNum = Number(id);
  const product = await getProductById(idNum);
  if (!product) return { title: "Product not found - KicksHub" };

  return {
    title: `${product.name} — KicksHub`,
    description: product.description
      ? String(product.description).replace(/<[^>]+>/g, "").slice(0, 160)
      : "Authentic thrifted sneakers.",
    openGraph: {
      title: `${product.name} — KicksHub`,
      description: product.description
        ? String(product.description).replace(/<[^>]+>/g, "").slice(0, 160)
        : "Authentic thrifted sneakers.",
      images: product.image ? [product.image] : undefined,
      url: `${process.env.SITE_URL ?? "http://localhost:3000"}/products/${encodeURIComponent(
        String(product.id ?? product.name)
      )}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = (await params) as { id?: string };
  const idNum = Number(id);
  const product = await getProductById(idNum);
  return <ProductDetailClient product={product} />;
}

