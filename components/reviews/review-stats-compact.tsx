"use client";

import { useEffect, useState } from "react";
import { StarRating } from "./star-rating";
import { cn } from "@/lib/utils";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ReviewStatsCompactProps {
  productId: number;
  className?: string;
  onScrollToReviews?: () => void;
}

export function ReviewStatsCompact({
  productId,
  className,
  onScrollToReviews,
}: ReviewStatsCompactProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/reviews?productId=${productId}&statsOnly=true`
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch review stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [productId]);

  if (isLoading) {
    return (
      <div
        className={cn("h-5 w-32 bg-muted animate-pulse rounded", className)}
      />
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <button
        onClick={onScrollToReviews}
        className={cn(
          "text-sm text-muted-foreground hover:text-foreground transition-colors",
          className
        )}
      >
        Be the first to review
      </button>
    );
  }

  return (
    <button
      onClick={onScrollToReviews}
      className={cn("flex items-center gap-2 group", className)}
    >
      <StarRating rating={stats.averageRating} size="sm" showValue />
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        ({stats.totalReviews.toLocaleString()}{" "}
        {stats.totalReviews === 1 ? "review" : "reviews"})
      </span>
    </button>
  );
}
