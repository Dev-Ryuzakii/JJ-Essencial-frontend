import { create } from 'zustand'
import type { Product, Category, ProductFilters } from '../types'

interface ProductState {
  products: Product[]
  categories: Category[]
  currentProduct: Product | null
  filters: ProductFilters
  isLoading: boolean
  error: string | null
  
  // Actions
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setCurrentProduct: (product: Product | null) => void
  setFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  currentProduct: null,
  filters: {},
  isLoading: false,
  error: null,
  
  setProducts: (products) => set({ products }),
  
  setCategories: (categories) => set({ categories }),
  
  setCurrentProduct: (product) => set({ currentProduct: product }),
  
  setFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  clearFilters: () => set({ filters: {} }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}))
