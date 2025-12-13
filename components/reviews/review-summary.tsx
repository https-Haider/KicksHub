"use client";

import { StarRating } from "./star-rating";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recommendationPercentage: number;
}

interface ReviewSummaryProps {
  stats: ReviewStats;
  className?: string;
}

export function ReviewSummary({ stats, className }: ReviewSummaryProps) {
  const {
    averageRating,
    totalReviews,
    ratingDistribution,
    recommendationPercentage,
  } = stats;

  if (totalReviews === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-muted-foreground mb-2">No reviews yet</div>
        <p className="text-sm text-muted-foreground">
          Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-8 md:grid-cols-2", className)}>
      {/* Left side - Average rating */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-5xl font-bold text-foreground mb-2">
          {averageRating.toFixed(1)}
        </div>
        <StarRating rating={averageRating} size="lg" className="mb-2" />
        <div className="text-sm text-muted-foreground">
          Based on {totalReviews.toLocaleString()}{" "}
          {totalReviews === 1 ? "review" : "reviews"}
        </div>
        {recommendationPercentage > 0 && (
          <div className="mt-3 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
            {recommendationPercentage}% would recommend
          </div>
        )}
      </div>

      {/* Right side - Rating distribution */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count =
            ratingDistribution[star as keyof typeof ratingDistribution];
          const percentage =
            totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 justify-end">
                <span className="text-sm font-medium text-foreground">
                  {star}
                </span>
                <StarRating rating={1} maxRating={1} size="sm" />
              </div>
              <div className="flex-1">
                <Progress value={percentage} className="h-2" />
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {count.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
