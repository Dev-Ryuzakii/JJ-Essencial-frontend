import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

interface RatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  className?: string
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className,
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const filled = index < Math.floor(rating)
    const partiallyFilled = index < rating && index >= Math.floor(rating)

    return (
      <div key={index} className="relative">
        <Star
          className={cn(
            sizes[size],
            filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
        />
        {partiallyFilled && (
          <Star
            className={cn(
              'absolute top-0 left-0 text-yellow-400 fill-yellow-400',
              sizes[size]
            )}
            style={{
              clipPath: `inset(0 ₦{100 - (rating % 1) * 100}% 0 0)`,
            }}
          />
        )}
      </div>
    )
  })

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex space-x-0.5">
        {stars}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface InteractiveRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  className,
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (starRating: number) => {
    onRatingChange(starRating)
  }

  const handleMouseEnter = (starRating: number) => {
    setHoveredRating(starRating)
  }

  const handleMouseLeave = () => {
    setHoveredRating(0)
  }

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starRating = index + 1
    const filled = starRating <= (hoveredRating || rating)

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(starRating)}
        onMouseEnter={() => handleMouseEnter(starRating)}
        onMouseLeave={handleMouseLeave}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        <Star
          className={cn(
            sizes[size],
            filled 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300 hover:text-yellow-400',
            'transition-colors cursor-pointer'
          )}
        />
      </button>
    )
  })

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {stars}
    </div>
  )
}
