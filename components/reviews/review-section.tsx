"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ReviewSummary } from "./review-summary";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageSquare } from "lucide-react";

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

interface Review {
  _id?: string;
  productId: number;
  rating: number;
  title?: string;
  content?: string;
  authorName: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
}

interface ReviewSectionProps {
  productId: number;
  productName: string;
  className?: string;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest" | "most-helpful";

const REVIEWS_PER_PAGE = 5;

export function ReviewSection({
  productId,
  productName,
  className,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track current reviews length for pagination without causing re-renders
  const reviewsLengthRef = useRef(0);
  reviewsLengthRef.current = reviews.length;

  const fetchReviews = useCallback(
    async (reset: boolean = false) => {
      try {
        if (reset) {
          setIsLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const offset = reset ? 0 : reviewsLengthRef.current;
        const params = new URLSearchParams({
          productId: productId.toString(),
          sort: sortBy,
          limit: REVIEWS_PER_PAGE.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/reviews?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (reset) {
          setReviews(data.reviews || []);
          setStats(data.stats || null);
        } else {
          setReviews((prev) => [...prev, ...(data.reviews || [])]);
        }

        setHasMore((data.reviews || []).length === REVIEWS_PER_PAGE);
      } catch (err: any) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [productId, sortBy]
  );

  // Initial fetch and refetch when sort changes
  useEffect(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews after new submission
    fetchReviews(true);
  };

  const handleLoadMore = () => {
    fetchReviews(false);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchReviews(true)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Customer Reviews
          </h2>
          {stats && stats.totalReviews > 0 && (
            <span className="text-muted-foreground">
              ({stats.totalReviews.toLocaleString()})
            </span>
          )}
        </div>
        <ReviewForm
          productId={productId}
          productName={productName}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>

      {/* Summary */}
      {stats && (
        <div className="bg-muted/30 rounded-xl p-6 border border-border">
          <ReviewSummary stats={stats} />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div>
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <span className="text-sm text-muted-foreground">
              Showing {reviews.length} of {stats?.totalReviews || 0} reviews
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="most-helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ReviewList reviews={reviews} />

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="gap-2"
              >
                {isLoadingMore ? (
                  "Loading..."
                ) : (
                  <>
                    Load More Reviews
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state (when stats exist but no reviews shown yet) */}
      {reviews.length === 0 && stats && stats.totalReviews === 0 && (
        <ReviewList reviews={[]} />
      )}
    </div>
  );
}
