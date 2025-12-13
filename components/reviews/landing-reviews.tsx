"use client";

import { useEffect, useState } from "react";
import { StarRating } from "./star-rating";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Quote,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  rating: number;
  content?: string;
  images?: string[];
  authorName: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

interface LandingReviewsProps {
  className?: string;
}

export function LandingReviews({ className }: LandingReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/reviews?sort=newest&limit=6");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length));
  };

  const prevReview = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + reviews.length) % Math.max(1, reviews.length)
    );
  };

  // Show 3 reviews at a time on desktop
  const visibleReviews = reviews.slice(0, 3);

  if (isLoading) {
    return (
      <section className={cn("py-16 md:py-24 bg-muted/30", className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-muted rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-4" />
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="h-4 w-32 bg-muted rounded" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 md:py-24 bg-muted/30", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Real reviews from sneaker enthusiasts who found their perfect pair
            at KicksHub
          </p>

          {/* Overall Stats */}
          {stats && stats.totalReviews > 0 && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-background rounded-full px-4 py-2 shadow-sm border border-border">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-xl font-bold text-foreground">
                  {stats.averageRating}
                </span>
                <span className="text-muted-foreground">out of 5</span>
              </div>
              <div className="text-muted-foreground">
                Based on{" "}
                <span className="font-semibold text-foreground">
                  {stats.totalReviews}
                </span>{" "}
                reviews
              </div>
              {stats.recommendationPercentage > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {stats.recommendationPercentage}% recommend
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {visibleReviews.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {visibleReviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {/* Navigation for more reviews */}
            {reviews.length > 3 && (
              <div className="flex justify-center gap-2 mb-8">
                {reviews.slice(0, 6).map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      idx < 3 ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                    aria-label={`Review ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Quote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}

        {/* Write Review CTA */}
        <div className="text-center">
          <ReviewForm
            onReviewSubmitted={handleReviewSubmitted}
            className="inline-flex"
          />
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const createdDate = new Date(review.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  // Generate initials
  const initials = review.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-6 h-full flex flex-col bg-background hover:shadow-lg transition-shadow duration-300">
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-primary/20 mb-4" />

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Content */}
      <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-4 line-clamp-3">
        {review.content || "Great experience with KicksHub!"}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Review image ${idx + 1}`}
              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            />
          ))}
          {review.images.length > 3 && (
            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                +{review.images.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-primary">{initials}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground text-sm truncate">
              {review.authorName}
            </span>
            {review.verified && (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
    </Card>
  );
}
