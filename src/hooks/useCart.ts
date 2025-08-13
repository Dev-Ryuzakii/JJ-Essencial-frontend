import { useCartStore } from '../store'
import toast from 'react-hot-toast'
import type { Product } from '../types'

export const useCart = () => {
  const {
    items,
    totalItems,
    totalAmount,
    discountAmount,
    finalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const addToCart = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Cannot add more items. Stock limit reached.')
        return false
      }
    }
    
    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return false
    }

    const cartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0] || '',
      stock: product.stock,
    }

    addItem(cartItem)
    toast.success('Item added to cart')
    return true
  }

  const removeFromCart = (productId: string) => {
    removeItem(productId)
    toast.success('Item removed from cart')
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const item = items.find(item => item.productId === productId)
    
    if (!item) return false
    
    if (quantity > item.stock) {
      toast.error('Cannot exceed available stock')
      return false
    }
    
    if (quantity <= 0) {
      removeFromCart(productId)
      return true
    }
    
    updateQuantity(productId, quantity)
    return true
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Cart cleared')
  }

  const isInCart = (productId: string): boolean => {
    return items.some(item => item.productId === productId)
  }

  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.productId === productId)
    return item?.quantity || 0
  }

  const canAddToCart = (productId: string): boolean => {
    const item = items.find(item => item.productId === productId)
    return !item || item.quantity < item.stock
  }

  const getSubtotal = (): number => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.discountPrice || item.price)
      return total + (price * item.quantity)
    }, 0)
  }

  const getFinalAmount = (): number => {
    return finalAmount
  }

  const getCartSummary = () => ({
    totalItems,
    totalAmount,
    discountAmount,
    finalAmount,
    savings: discountAmount,
    isEmpty: items.length === 0,
  })

  const hasItems = items.length > 0

  return {
    items,
    totalItems,
    totalAmount,
    discountAmount,
    finalAmount,
    hasItems,
    addToCart,
    removeFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    isInCart,
    getItemQuantity,
    canAddToCart,
    getCartSummary,
    getCartTotal,
    getCartCount,
    getSubtotal,
    getFinalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  }
}
