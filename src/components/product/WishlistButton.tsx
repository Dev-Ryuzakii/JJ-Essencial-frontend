import React from 'react'
import { Heart } from 'lucide-react'
import { useWishlist } from '../../hooks'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'button'
  className?: string
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 'md',
  variant = 'icon',
  className = ''
}) => {
  const { isInWishlist, toggleWishlistItem } = useWishlist()
  const inWishlist = isInWishlist(productId)

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlistItem(productId)
  }

  // Size configurations
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggleWishlist}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
          inWishlist
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white text-gray-600 hover:text-red-500 hover:bg-gray-50'
        } transition-colors shadow-sm ${className}`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`${iconSizes[size]} ${inWishlist ? 'fill-current' : ''}`}
        />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      className={`flex items-center justify-center px-4 py-2 rounded-lg ${
        inWishlist
          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
      } transition-colors ${className}`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`${iconSizes['sm']} mr-2 ${inWishlist ? 'fill-current' : ''}`}
      />
      {inWishlist ? 'Saved' : 'Save'}
    </button>
  )
}

export default WishlistButton
