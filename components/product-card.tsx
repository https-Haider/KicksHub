import { Card } from "@/components/ui/card";
import { ArrowUpRight, ImageIcon } from "lucide-react";
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
    <Link href={`/products/${getProductSlug(product)}`} className="group block rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
    <Card className="h-full gap-0 overflow-hidden rounded-[1.5rem] border-black/10 bg-card py-0 shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(31,33,29,.12)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name || "Product image"}
          fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
        {/* Image count indicator */}
        {totalImages > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            <ImageIcon className="w-3 h-3" />
            <span>{totalImages}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-ink backdrop-blur">{product.condition?.replace("-", " ")}</span>
      </div>
      <div className="p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[.15em] text-rust">{product.category || "Curated pair"}</p>
        <h3 className="mb-4 line-clamp-2 min-h-[2.8rem] text-base font-bold leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-ink">{formatPKR(product.price)}</span>
          <span className="grid size-9 place-items-center rounded-full border border-black/15 transition-colors group-hover:bg-rust group-hover:text-white"><ArrowUpRight className="size-4" /></span>
        </div>
      </div>
    </Card>
    </Link>
  );
}
