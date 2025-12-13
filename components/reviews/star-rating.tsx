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

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.min(
            100,
            Math.max(0, (rating - index) * 100)
          );
          const isFull = fillPercentage >= 100;
          const isPartial = fillPercentage > 0 && fillPercentage < 100;
          const isEmpty = fillPercentage <= 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={!interactive}
              className={cn(
                "relative transition-transform",
                interactive &&
                  "cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded",
                !interactive && "cursor-default"
              )}
              aria-label={
                interactive
                  ? `Rate ${index + 1} out of ${maxRating} stars`
                  : undefined
              }
              tabIndex={interactive ? 0 : -1}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-muted-foreground/30 stroke-muted-foreground/50"
                )}
              />
              {/* Filled star overlay */}
              {!isEmpty && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "fill-amber-400 text-amber-400"
                    )}
                  />
                </div>
              )}
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
