"use client";

import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, CheckCircle, User } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

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

interface ReviewItemProps {
  review: Review;
  onVote?: (reviewId: string, isHelpful: boolean) => void;
}

export function ReviewItem({ review, onVote }: ReviewItemProps) {
  const [localHelpful, setLocalHelpful] = useState(review.helpful);
  const [localNotHelpful, setLocalNotHelpful] = useState(review.notHelpful);
  const [hasVoted, setHasVoted] = useState<"helpful" | "not-helpful" | null>(
    null
  );
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    if (hasVoted || isVoting || !review._id) return;

    setIsVoting(true);

    try {
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "vote",
          isHelpful,
        }),
      });

      if (response.ok) {
        if (isHelpful) {
          setLocalHelpful((prev) => prev + 1);
          setHasVoted("helpful");
        } else {
          setLocalNotHelpful((prev) => prev + 1);
          setHasVoted("not-helpful");
        }
        onVote?.(review._id, isHelpful);
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const createdDate = new Date(review.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  // Generate initials for avatar
  const initials = review.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="py-6 border-b border-border last:border-0">
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">
              {review.authorName}
            </span>
            {review.verified && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle className="w-3 h-3" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      )}

      {/* Content */}
      {review.content && (
        <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
          {review.content}
        </p>
      )}

      {/* Helpful */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Was this review helpful?</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 h-8",
              hasVoted === "helpful" && "text-green-600 bg-green-500/10"
            )}
            onClick={() => handleVote(true)}
            disabled={!!hasVoted || isVoting}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{localHelpful}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 h-8",
              hasVoted === "not-helpful" && "text-red-600 bg-red-500/10"
            )}
            onClick={() => handleVote(false)}
            disabled={!!hasVoted || isVoting}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{localNotHelpful}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ReviewListProps {
  reviews: Review[];
  onVote?: (reviewId: string, isHelpful: boolean) => void;
  className?: string;
}

export function ReviewList({ reviews, onVote, className }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">
          No reviews yet. Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-border", className)}>
      {reviews.map((review) => (
        <ReviewItem key={review._id} review={review} onVote={onVote} />
      ))}
    </div>
  );
}
