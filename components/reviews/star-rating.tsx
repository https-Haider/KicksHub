"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

function StarIcon({
  size,
  fillPercentage,
}: {
  size: "sm" | "md" | "lg";
  fillPercentage: number;
}) {
  const isEmpty = fillPercentage <= 0;

  return (
    <span className="relative inline-block">
      {/* Background star (empty) */}
      <Star
        className={cn(
          sizeClasses[size],
          "text-muted-foreground/30 stroke-muted-foreground/50"
        )}
      />
      {/* Filled star overlay */}
      {!isEmpty && (
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star
            className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")}
          />
        </span>
      )}
    </span>
  );
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (interactive && onChange && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onChange(index + 1);
    }
  };

  // Non-interactive: render as a static display with proper accessibility
  if (!interactive) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div
          className="flex items-center"
          role="img"
          aria-label={`${rating.toFixed(1)} out of ${maxRating} stars`}
        >
          {Array.from({ length: maxRating }).map((_, index) => {
            const fillPercentage = Math.min(
              100,
              Math.max(0, (rating - index) * 100)
            );
            return (
              <StarIcon
                key={index}
                size={size}
                fillPercentage={fillPercentage}
              />
            );
          })}
        </div>
        {showValue && (
          <span className="ml-1 text-sm font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  // Interactive: render with buttons for user input
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" role="group" aria-label="Star rating">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.min(
            100,
            Math.max(0, (rating - index) * 100)
          );

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="relative transition-transform cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
              aria-label={`Rate ${index + 1} out of ${maxRating} stars`}
            >
              <StarIcon size={size} fillPercentage={fillPercentage} />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
