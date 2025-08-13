import { useState, useEffect } from 'react'
import { useProductStore } from '../store'
import { productsApi, categoriesApi } from '../lib/api'
import toast from 'react-hot-toast'
import type { Product, Category, ProductFilters } from '../types'

export const useProducts = (filters?: ProductFilters) => {
  const {
    products,
    categories,
    currentProduct,
    filters: storeFilters,
    isLoading,
    error,
    setProducts,
    setCategories,
    setCurrentProduct,
    setFilters,
    setLoading,
    setError,
  } = useProductStore()

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  })

  // Fetch products with filters
  const fetchProducts = async (page = 1, limit = 12, customFilters?: ProductFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryFilters = { ...storeFilters, ...customFilters }
      const params = {
        page,
        limit,
        ...queryFilters,
      }

      const response = await productsApi.getAll(params)
      
      if (response.success) {
        setProducts(response.data.items)
        setPagination({
          currentPage: response.data.meta.currentPage,
          totalPages: response.data.meta.totalPages,
          totalItems: response.data.meta.totalItems,
          itemsPerPage: response.data.meta.itemsPerPage,
        })
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to fetch products'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch single product
  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productsApi.getById(id)
      
      if (response.success) {
        setCurrentProduct(response.data)
        return response.data
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to fetch product'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async (nested = false) => {
    try {
      const response = await categoriesApi.getAll(nested)
      
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to fetch categories'
      toast.error(message)
    }
  }

  // Apply filters
  const applyFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(newFilters)
    fetchProducts(1, pagination.itemsPerPage, newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({})
    fetchProducts(1, pagination.itemsPerPage, {})
  }

  // Load more products (for infinite scroll)
  const loadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchProducts(pagination.currentPage + 1, pagination.itemsPerPage)
    }
  }

  // Search products
  const searchProducts = (query: string) => {
    applyFilters({ search: query })
  }

  // Filter by category
  const filterByCategory = (categoryId: string) => {
    applyFilters({ category: categoryId })
  }

  // Sort products
  const sortProducts = (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    applyFilters({ sortBy: sortBy as any, sortOrder })
  }

  // Initialize with filters
  useEffect(() => {
    if (filters) {
      setFilters(filters)
    }
  }, [filters, setFilters])

  return {
    products,
    categories,
    currentProduct,
    filters: storeFilters,
    pagination,
    isLoading,
    error,
    fetchProducts,
    fetchProduct,
    fetchCategories,
    applyFilters,
    clearFilters,
    loadMore,
    searchProducts,
    filterByCategory,
    sortProducts,
  }
}
