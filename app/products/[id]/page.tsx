import type { Metadata } from "next";
import { getProductById, getProductBySlug } from "@/lib/products.server";
import ProductDetailClient from "@/components/product-detail-client";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = (await params) as { id?: string };
  if (!id) return {};
  // accept either numeric id or slug here
  const maybeNum = Number(id);
  const product =
    !Number.isNaN(maybeNum) && String(maybeNum) === String(id)
      ? await getProductById(maybeNum)
      : await getProductBySlug(id as string);
  if (!product) return { title: "Product not found - KicksHub" };

  const title = (product as any).seoTitle || `${product.name} — KicksHub`;
  const description = (product as any).seoDescription
    ? String((product as any).seoDescription)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)
    : product.description
    ? String(product.description)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)
    : "Authentic thrifted sneakers.";
  const keywordsRaw = (product as any).seoKeywords || "";
  const keywords = keywordsRaw
    ? keywordsRaw
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: product.image ? [product.image] : undefined,
      url: `${
        process.env.SITE_URL ?? "http://localhost:3000"
      }/products/${encodeURIComponent(String(product.id ?? product.name))}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = (await params) as { id?: string };
  // accept either numeric id or slug in this param
  const maybeNum = Number(id);
  const product =
    !Number.isNaN(maybeNum) && String(maybeNum) === String(id)
      ? await getProductById(maybeNum)
      : await getProductBySlug(id as string);

  const baseUrl = process.env.SITE_URL || "https://www.kickshub.site";
  const productUrl = `${baseUrl}/products/${id}`;

  // Extract brand from product name (first word usually)
  const brand = product?.name?.split(" ")[0] || "Unknown";

  // Map condition to schema.org format
  const conditionMap: Record<
    string,
    "NewCondition" | "UsedCondition" | "RefurbishedCondition"
  > = {
    "like-new": "RefurbishedCondition",
    excellent: "UsedCondition",
    good: "UsedCondition",
    fair: "UsedCondition",
  };

  return (
    <>
      {product && (
        <>
          <ProductSchema
            name={product.name}
            description={product.description || "Premium thrifted sneakers"}
            image={product.image || "/placeholder.svg"}
            price={product.price}
            currency="PKR"
            sku={product.sku || String(product.id)}
            brand={brand}
            condition={
              conditionMap[product.condition || "good"] || "UsedCondition"
            }
            availability={product.inStock ? "InStock" : "OutOfStock"}
            url={productUrl}
            rating={product.rating}
            reviewCount={product.reviews}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: baseUrl },
              { name: "Products", url: `${baseUrl}/products` },
              { name: product.name, url: productUrl },
            ]}
          />
        </>
      )}
      <ProductDetailClient product={product} />
    </>
  );
}
