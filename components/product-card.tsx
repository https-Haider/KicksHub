import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductSlug } from "@/lib/products";
import { formatPKR } from "@/lib/commerce";

interface ProductCardProps { product: Product }

export function ProductCard({ product }: ProductCardProps) {
  // Calculate total images (main + additional)
  const totalImages = new Set([product.image, ...(product.images || [])].filter(Boolean)).size;

  return (
    <Link href={`/products/${getProductSlug(product)}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group h-full">
      <div className="relative h-64 overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name || "Product image"}
          fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Image count indicator */}
        {totalImages > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
            <ImageIcon className="w-3 h-3" />
            <span>{totalImages}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{formatPKR(product.price)}</span>
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>
      </div>
    </Card>
    </Link>
  );
}
