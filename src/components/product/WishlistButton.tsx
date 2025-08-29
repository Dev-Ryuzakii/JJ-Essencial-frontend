import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  className = '', 
  size = 'md' 
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const isWishlisted = isInWishlist(productId);
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    if (isWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };
  
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        rounded-full
        border
        transition-all
        duration-200
        flex
        items-center
        justify-center
        ${isWishlisted 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-200'
        }
        ${className}
      `}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      type="button"
    >
      <Heart 
        className={`${iconSizes[size]} ${isWishlisted ? 'fill-current' : ''}`} 
      />
    </button>
  );
};

export default WishlistButton;