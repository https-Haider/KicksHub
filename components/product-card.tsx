import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  images,
  category,
}: ProductCardProps) {
  // Calculate total images (main + additional)
  const totalImages = (image ? 1 : 0) + (images?.length || 0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
      <div className="relative h-64 overflow-hidden bg-muted">
        <img
          src={image || "/placeholder.svg"}
          alt={name || "Product image"}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${price}</span>
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>
      </div>
    </Card>
  );
}
