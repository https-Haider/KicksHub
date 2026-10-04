import type { Metadata } from "next";
import { getProductById, getProductBySlug } from "@/lib/products.server";
import ProductDetailClient from "@/components/product-detail-client";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/json-ld";
import { notFound, permanentRedirect } from "next/navigation";

import { SITE_URL, absoluteUrl, SOCIAL_IMAGE } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return {};
  // accept either numeric id or slug here
  const maybeNum = Number(id);
  const product =
    !Number.isNaN(maybeNum) && String(maybeNum) === String(id)
      ? await getProductById(maybeNum)
      : await getProductBySlug(id as string);
  if (!product || product.isActive === false || product.published === false) return { title: "Product not found", robots: { index: false, follow: false } };

  const title = (product.seoTitle || product.name).replace(/\s*(?:[|—–-])\s*KicksHub\s*$/i, "");
  const description = product.seoDescription
    ? String(product.seoDescription)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)
    : product.description
    ? String(product.description)
        .replace(/<[^>]+>/g, "")
        .slice(0, 160)
    : "Pre-owned sneakers available for delivery in Pakistan.";
  const keywordsRaw = product.seoKeywords || "";
  const keywords = keywordsRaw
    ? keywordsRaw
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean)
    : undefined;

  const baseUrl = SITE_URL;
  const productSlug = product.slug || id;
  const canonicalUrl = `${baseUrl}/products/${encodeURIComponent(productSlug)}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | KicksHub`,
      description,
      images: [absoluteUrl(product.image || SOCIAL_IMAGE)],
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | KicksHub`,
      description,
      images: [absoluteUrl(product.image || SOCIAL_IMAGE)],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  // accept either numeric id or slug in this param
  const maybeNum = Number(id);
  const product =
    !Number.isNaN(maybeNum) && String(maybeNum) === String(id)
      ? await getProductById(maybeNum)
      : await getProductBySlug(id as string);

  if (!product || product.isActive === false || product.published === false) notFound();
  if (product.slug && product.slug !== id) permanentRedirect(`/products/${encodeURIComponent(product.slug)}`);

  const baseUrl = SITE_URL;
  const productUrl = `${baseUrl}/products/${encodeURIComponent(product.slug || id)}`;

  // Extract brand from product name (first word usually)
  const brand = product?.name?.split(" ")[0] || "Unknown";

  // Map condition to schema.org format
  const conditionMap: Record<
    string,
    "NewCondition" | "UsedCondition" | "RefurbishedCondition"
  > = {
    "like-new": "UsedCondition",
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
            image={absoluteUrl(product.image || "/placeholder.svg")}
            price={product.price}
            currency="PKR"
            sku={product.sku || String(product.id)}
            brand={brand}
            condition={
              conditionMap[product.condition || "good"] || "UsedCondition"
            }
            availability={product.inStock !== false && (product.stockQuantity ?? 0) > 0 ? "InStock" : "OutOfStock"}
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
