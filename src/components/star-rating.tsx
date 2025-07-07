"use client";

import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  readOnly?: boolean;
  onValueChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  readOnly = false,
  onValueChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [currentRating, setCurrentRating] = React.useState(rating);

  const handleStarClick = (starValue: number) => {
    if (!readOnly && onValueChange) {
      setCurrentRating(starValue);
      onValueChange(starValue);
    }
  };

  const displayRating = hoverRating ?? currentRating;

  const starElements = [];
  for (let i = 1; i <= totalStars; i++) {
    const isFull = displayRating >= i;
    const isHalf = displayRating > i - 1 && displayRating < i;

    starElements.push(
      <div
        key={i}
        onMouseEnter={readOnly ? undefined : () => setHoverRating(i)}
        onMouseLeave={readOnly ? undefined : () => setHoverRating(null)}
        onClick={() => handleStarClick(i)}
        className={cn(!readOnly && "cursor-pointer")}
      >
        <Star
          size={size}
          className={cn(
            "transition-colors",
            isFull ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
          )}
        />
      </div>
    );
  }

  return <div className={cn("flex items-center gap-1", className)}>{starElements}</div>;
}
