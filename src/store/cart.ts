import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Cart } from '../types'

interface Coupon {
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount?: number
}

interface CartState extends Cart {
  appliedCoupon: Coupon | null
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updatesQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  applyCoupon: (coupon: Coupon) => boolean
  removeCoupon: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
      appliedCoupon: null,

      addItem: (newItem) => {
        const state = get()
        const existingItem = state.items.find(item => item.productId === newItem.productId)
        
        let updatesdItems: CartItem[]
        
        if (existingItem) {
          // updates quantity of existing item
          updatesdItems = state.items.map(item =>
            item.productId === newItem.productId
              ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
              : item
          )
        } else {
          // Add new item
          updatesdItems = [...state.items, { ...newItem, quantity: 1 }]
        }
        
        const totals = calculateTotals(updatesdItems, state.appliedCoupon)
        set({ items: updatesdItems, ...totals })
      },

      removeItem: (productId) => {
        const state = get()
        const updatesdItems = state.items.filter(item => item.productId !== productId)
        const totals = calculateTotals(updatesdItems, state.appliedCoupon)
        set({ items: updatesdItems, ...totals })
      },

      updatesQuantity: (productId, quantity) => {
        const state = get()
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.removeItem(productId)
          return
        }
        
        const updatesdItems = state.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, item.stock) }
            : item
        )
        
        const totals = calculateTotals(updatesdItems, state.appliedCoupon)
        set({ items: updatesdItems, ...totals })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
          discountAmount: 0,
          finalAmount: 0,
          appliedCoupon: null,
        })
      },

      applyCoupon: (coupon) => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => {
          const price = parseFloat(item.discountPrice || item.price)
          return sum + (price * item.quantity)
        }, 0)

        // Check minimum order amount
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return false
        }

        const totals = calculateTotals(state.items, coupon)
        set({ appliedCoupon: coupon, ...totals })
        return true
      },

      removeCoupon: () => {
        const state = get()
        const totals = calculateTotals(state.items, null)
        set({ appliedCoupon: null, ...totals })
      },

      getCartTotal: () => get().finalAmount,
      
      getCartCount: () => get().totalItems,
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Helper function to calculate cart totals
function calculateTotals(items: CartItem[], appliedCoupon?: Coupon | null) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.discountPrice || item.price)
    return sum + (price * item.quantity)
  }, 0)
  
  const productDiscounts = items.reduce((sum, item) => {
    if (item.discountPrice) {
      const originalPrice = parseFloat(item.price)
      const discountPrice = parseFloat(item.discountPrice)
      const discount = (originalPrice - discountPrice) * item.quantity
      return sum + discount
    }
    return sum
  }, 0)

  let couponDiscount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      couponDiscount = subtotal * (appliedCoupon.value / 100)
    } else if (appliedCoupon.type === 'FIXED') {
      couponDiscount = Math.min(appliedCoupon.value, subtotal)
    }
  }
  
  const totalAmount = subtotal
  const discountAmount = productDiscounts + couponDiscount
  const finalAmount = totalAmount - couponDiscount
  
  return {
    totalItems,
    totalAmount,
    discountAmount,
    finalAmount,
  }
}
