"use client"

import { Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  maxRating?: number
}

export function RatingStars({ rating, onRate, readonly = false, size = "md", maxRating = 10 }: RatingStarsProps) {
  const [hover, setHover] = useState(0)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const stars = Math.ceil(maxRating / 2) // Display 5 stars for 10-point scale

  return (
    <div className="flex items-center gap-1">
      {[...Array(stars)].map((_, index) => {
        const ratingValue = (index + 1) * 2
        const isHalf = rating >= ratingValue - 1 && rating < ratingValue
        const isFilled = rating >= ratingValue || (hover && hover >= ratingValue)
        const isHovered = hover && hover >= ratingValue

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate?.(ratingValue)}
            onMouseEnter={() => !readonly && setHover(ratingValue)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={cn("transition-all duration-200", !readonly && "cursor-pointer hover:scale-110")}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled || isHovered
                  ? "fill-yellow-400 text-yellow-400"
                  : isHalf
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-transparent text-muted-foreground",
              )}
            />
          </button>
        )
      })}
      {!readonly && <span className="ml-2 text-sm text-muted-foreground">{hover || rating}/10</span>}
    </div>
  )
}
