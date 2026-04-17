import { Star } from "lucide-react";
import { classNames } from "../../utils/helpers";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function RatingStars({
  rating = 0,
  maxRating = 5,
  size = "md",
  showValue = true,
  reviewCount,
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={classNames("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          const percentage = partial ? (rating % 1) * 100 : 0;

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              disabled={!interactive}
              className={classNames(
                "relative",
                interactive &&
                  "cursor-pointer hover:scale-110 transition-transform",
                !interactive && "cursor-default"
              )}
            >
              {/* Empty star (background) */}
              <Star
                className={classNames(sizeClasses[size], "text-secondary-300")}
                fill="currentColor"
              />
              {/* Filled star (overlay) */}
              {(filled || partial) && (
                <Star
                  className={classNames(
                    sizeClasses[size],
                    "text-primary-500 absolute top-0 right-0"
                  )}
                  fill="currentColor"
                  style={
                    partial
                      ? { clipPath: `inset(0 ${100 - percentage}% 0 0)` }
                      : undefined
                  }
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span
          className={classNames(
            textSizeClasses[size],
            "text-secondary-700 font-medium mr-1"
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span
          className={classNames(textSizeClasses[size], "text-secondary-500")}
        >
          ({reviewCount.toLocaleString("he-IL")})
        </span>
      )}
    </div>
  );
}
