import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Package,
  Upload
} from 'lucide-react'
import adminProductsApi, { type AdminProduct, type AdminProductFilter, type AdminProductsResponse } from '../../services/adminProductsApi'
import adminCategoriesApi, { type AdminCategory } from '../../services/adminCategoriesApi'

export default function ProductManagement() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AdminProductFilter>({
    search: '',
    categoryId: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<AdminProduct | null>(null)
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  // Form data for create/edit
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    categoryId: ''
  })
  
  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{id: string, url: string, isMain: boolean}[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [page, filters])

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviewUrls])

  const fetchCategories = async () => {
    try {
      const categories = await adminCategoriesApi.getCategories({
        includeInactive: false
      })
      setCategories(categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setCategories([])
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching products with filters:', {
        page,
        limit: 10,
        ...filters
      })
      
      const response = await adminProductsApi.getProducts({
        page,
        limit: 10,
        ...filters
      })
      
      console.log('Products response:', response)
      
      // Debug: Check raw API response for isActive field
      if (response.data && response.data.length > 0) {
        console.log('First product raw data:', response.data[0])
        console.log('isActive field in first product:', response.data[0].isActive)
        console.log('All isActive values:', response.data.map(p => ({ name: p.name, isActive: p.isActive })))
      }
      
      if (!response || !response.success || !Array.isArray(response.data)) {
        console.warn('No data returned from API or data is not in expected format')
        setProducts([])
        setTotalPages(1)
      } else {
        // Process products to handle image parsing and ensure proper data format
        const processedProducts = response.data.map((product: any) => {
          let images = []
          
          if (product.images && Array.isArray(product.images)) {
            images = product.images.map((img: any) => {
              if (typeof img === 'string') {
                try {
                  const parsed = JSON.parse(img)
                  return {
                    id: parsed.id || Math.random().toString(),
                    url: parsed.url || img,
                    isMain: parsed.isMain || false,
                    sortOrder: parsed.sortOrder || 0
                  }
                } catch {
                  return {
                    id: Math.random().toString(),
                    url: img,
                    isMain: false,
                    sortOrder: 0
                  }
                }
              }
              return {
                id: img.id || Math.random().toString(),
                url: img.url || img,
                isMain: img.isMain || false,
                sortOrder: img.sortOrder || 0
              }
            })
          }
          
          return {
            ...product,
            images: images,
            price: typeof product.price === 'string' ? product.price : product.price?.toString() || '0',
            // Fix field name mapping from snake_case to camelCase
            isActive: product.is_active !== undefined ? product.is_active : product.isActive,
            categoryId: product.category_id || product.categoryId
          }
        })
        
        setProducts(processedProducts)
        
        // Debug: Check processed products isActive field
        console.log('Processed products isActive status:', 
          processedProducts.map(p => ({ name: p.name, isActive: p.isActive }))
        )
        
        // Extract pagination info if available
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1)
          console.log(`Loaded ${response.data.length} products, total pages: ${response.pagination.pages || 1}`)
        } else {
          setTotalPages(1)
          console.log(`Loaded ${response.data.length} products, no pagination info available`)
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to fetch products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    })
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(product => product.id))
    }
  }

  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const handleCreateProduct = () => {
    setProductFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      categoryId: ''
    })
    
    // Reset all image states
    setSelectedImages([])
    setImagePreviewUrls([])
    setExistingImages([])
    setImagesToDelete([])
    setCurrentProduct(null)
    
    setShowCreateModal(true)
  }

  const handleEditProduct = (product: AdminProduct) => {
    setCurrentProduct(product)
    setProductFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      sku: product.sku || '',
      stock: product.stock?.toString() || '',
      categoryId: product.categoryId || ''
    })
    
    // Reset image states
    setSelectedImages([])
    setImagePreviewUrls([])
    setExistingImages(product.images || [])
    setImagesToDelete([])
    
    setShowEditModal(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await adminProductsApi.deleteProduct(productId)
      fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) return
    
    try {
      await Promise.all(selectedProducts.map(id => adminProductsApi.deleteProduct(id)))
      setSelectedProducts([])
      fetchProducts()
    } catch (err) {
      console.error('Error deleting products:', err)
      setError('Failed to delete products. Please try again.')
    }
  }

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setProductFormData({
        ...productFormData,
        [name]: checkbox.checked
      })
    } else {
      setProductFormData({
        ...productFormData,
        [name]: value
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check number of files
    const maxFiles = 10
    if (files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images at once`)
      return
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setError('Please select only image files (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      const filenames = oversizedFiles.map(f => f.name).join(', ');
      setError(`Some files exceed the 5MB limit: ${filenames}`);
      return;
    }

    // Calculate total file size - optional additional validation
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB
    
    if (totalSize > maxTotalSize) {
      setError(`Total file size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds the 50MB limit.`);
      return;
    }

    setSelectedImages(files)
    setError(null) // Clear any previous errors
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file))
    setImagePreviewUrls(previewUrls)
  }

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index)
    
    // Revoke the removed URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    setSelectedImages(newFiles)
    setImagePreviewUrls(newUrls)
  }

  const handleSubmitProductForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert form data to proper types for API
    const apiData = {
      name: productFormData.name.trim(),
      description: productFormData.description.trim(),
      price: productFormData.price ? parseFloat(productFormData.price) : 0,
      // Remove salePrice
      stock: productFormData.stock ? parseInt(productFormData.stock, 10) : 0,
      sku: productFormData.sku.trim(),
      categoryId: productFormData.categoryId,
      // Remove featured
      // Add these if your backend expects them:
      lowStockThreshold: 10,
      isActive: true
    }
    
    console.log('Sending API data:', JSON.stringify(apiData, null, 2))
    
    try {
      // Validate required fields
      if (!productFormData.name.trim()) {
        setError('Product name is required')
        return
      }
      if (!productFormData.price || parseFloat(productFormData.price) <= 0) {
        setError('Product price must be greater than zero')
        return
      }
      if (!productFormData.sku.trim()) {
        setError('SKU is required')
        return
      }
      if (!productFormData.categoryId) {
        setError('Category is required')
        return
      }
      
      let productId: string
      
      if (showCreateModal) {
        const newProduct = await adminProductsApi.createProduct(apiData)
        productId = newProduct.id
        console.log('Product created:', newProduct)
      } else if (showEditModal && currentProduct) {
        const updatesdProduct = await adminProductsApi.updatesProduct(currentProduct.id, apiData)
        productId = currentProduct.id
        console.log('Product updatesd:', updatesdProduct)
        
        // Process any image deletions if in edit mode
        if (imagesToDelete.length > 0) {
          try {
            await Promise.all(
              imagesToDelete.map(imageId => 
                adminProductsApi.deleteProductImage(productId, imageId)
              )
            );
            console.log('Deleted images:', imagesToDelete);
          } catch (deleteError) {
            console.error('Error deleting images:', deleteError);
            setError('Product updatesd but there was an issue removing some images');
          }
        }
      } else {
        throw new Error('Invalid form state')
      }
      
      // Upload images if any selected
      if (selectedImages.length > 0) {
        try {
          setUploadProgress(10); // Start progress
          
          // Determine if we should set the first image as main
          // Set isMain=true if:
          // 1. This is a new product (no existing images) OR
          // 2. We're editing a product and there's no main image among existing images
          const shouldSetMainImage = 
            showCreateModal || 
            (showEditModal && !existingImages.some(img => img.isMain));
          
          setUploadProgress(30); // updates progress
          
          const uploadedImages = await adminProductsApi.uploadProductImages(
            productId, 
            selectedImages, 
            shouldSetMainImage // Only set as main if needed
          );
          
          setUploadProgress(100); // Complete progress
          console.log('Images uploaded successfully:', uploadedImages);
        } catch (imageError: any) {
          console.error('Error uploading images:', imageError);
          
          // Provide specific error messages based on the error
          let errorMsg = 'Product was saved successfully, but there was an issue uploading images. You can edit the product to add images later.';
          
          if (imageError.response?.status === 400) {
            errorMsg = 'Invalid image files. Please check file format and size.';
          } else if (imageError.response?.status === 401) {
            errorMsg = 'Authentication failed. Please log in again.';
            window.location.href = '/admin/login';
            return;
          } else if (imageError.response?.status === 404) {
            errorMsg = 'Product not found. Please refresh and try again.';
          } else if (imageError.response?.status === 413) {
            errorMsg = 'File size too large. Please use smaller images.';
          }
          
          setError(errorMsg);
          
          // Still allow the form to complete so user doesn't lose their work
          setShowCreateModal(false);
          setShowEditModal(false);
          
          // Reset state
          setCurrentProduct(null);
          setSelectedImages([]);
          setExistingImages([]);
          setImagesToDelete([]);
          setUploadProgress(0);
          
          // Clean up image previews to prevent memory leaks
          imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
          setImagePreviewUrls([]);
          
          // Refresh product list
          fetchProducts();
          
          return; // Exit the function early after handling the error
        }
      }
      
      setShowCreateModal(false)
      setShowEditModal(false)
      
      // Reset state
      setCurrentProduct(null)
      setSelectedImages([])
      setExistingImages([])
      setImagesToDelete([])
      setError(null)
      setUploadProgress(0)
      
      // Clean up image previews to prevent memory leaks
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
      setImagePreviewUrls([])
      
      // Reset to first page and ensure newest products are shown first
      setPage(1)
      setFilters(prev => ({
        ...prev,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      }))
      
      // Refresh product list with a slight delay to ensure backend has processed everything
      setTimeout(() => {
        fetchProducts()
        console.log('Refreshing products list after create/updates')
      }, 500)
    } catch (err: any) {
      console.error('Error saving product:', err)
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error('Error response data:', err.response.data)
        console.error('Error response status:', err.response.status)
      }
      console.error('Full error object:', err)
      console.log('Data that was sent:', JSON.stringify(apiData, null, 2))
      
      // Show more detailed error message based on status codes
      let errorMessage = 'Failed to save product. Please try again.'
      
      if (err.response?.status === 400) {
        // Bad request - likely validation errors
        if (err.response.data?.message && Array.isArray(err.response.data.message)) {
          errorMessage = `Validation errors: ${err.response.data.message.join(', ')}`
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message
        } else {
          errorMessage = 'Invalid data. Please check your inputs and try again.'
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.'
        // Redirect to admin login
        window.location.href = '/admin/login'
        return
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Resource not found. The category or product may have been deleted.'
      } else if (err.response?.status === 409) {
        errorMessage = 'A product with this SKU already exists.'
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please check: 1) SKU is unique, 2) Category exists, 3) All fields are valid.'
        if (err.response?.data?.message) {
          errorMessage += ` Server details: ${err.response.data.message}`
        }
      } else if (err.message && typeof err.message === 'string') {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setUploadProgress(0)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <p className="mt-2 text-gray-600">Manage your product catalog, inventory, and pricing</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 w-64"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
        </div>

        <div className="flex space-x-3">
          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedProducts.length})
            </button>
          )}

          {/* Add Product */}
          <button
            onClick={handleCreateProduct}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {console.log('Rendering products:', products)}
              {(products || []).length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover bg-gray-100 border border-gray-200"
                          src={product.images && product.images.length > 0 
                            ? (product.images.find(img => img.isMain)?.url || product.images[0]?.url) 
                            : '/api/placeholder/40/40'}
                          alt={product.name || 'Product image'}
                          onError={(e) => { 
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkMxNy43OTA5IDI2IDE2IDI0LjIwOTEgMTYgMjJDMTYgMTkuNzkwOSAxNy43OTA5IDE4IDIwIDE4QzIyLjIwOTEgMTggMjQgMTkuNzkwOSAyNCAyMkMyNCAyNC4yMDkxIDIyLjIwOTEgMjYgMjAgMjZaIiBmaWxsPSIjOUM5Qzk3Ii8+CjxwYXRoIGQ9Ik0xMiAxNFYyOEMxMiAyOC41NTIzIDEyLjQ0NzcgMjkgMTMgMjlIMjdDMjcuNTUyMyAyOSAyOCAyOC41NTIzIDI4IDI4VjE0QzI4IDEzLjQ0NzcgMjcuNTUyMyAxMyAyNyAxM0gxM0MxMi40NDc3IDEzIDEyIDEzLjQ0NzcgMTIgMTRaTTI2IDE2SDE0VjI3SDI2VjE2WiIgZmlsbD0iIzlDOUM5NyIvPgo8L3N2Zz4K';
                            target.alt = 'No image';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₦{parseFloat(product.price).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${product.stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(product.isActive ? 'active' : 'inactive')}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categories.find(c => c.id === product.categoryId)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-3 justify-end">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No products found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State - Only show when not loading and products array is empty */}
        {!loading && products.length === 0 && !document.querySelector('tbody tr') && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateProduct}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showCreateModal ? 'Create New Product' : 'Edit Product'}
              </h3>
              <form onSubmit={handleSubmitProductForm} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={productFormData.name}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={productFormData.description}
                    onChange={handleProductFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      required
                      value={productFormData.price}
                      onChange={handleProductFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      min="0"
                      required
                      value={productFormData.stock}
                      onChange={handleProductFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      id="sku"
                      required
                      value={productFormData.sku}
                      onChange={handleProductFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="categoryId"
                      id="categoryId"
                      required
                      value={productFormData.categoryId}
                      onChange={handleProductFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <input
                      type="file"
                      id="images"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        Click to upload images or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        JPEG, PNG, GIF, WebP up to 5MB each (max 10 images)
                      </span>
                    </label>
                    
                    {/* Existing Images (for edit mode) */}
                    {showEditModal && existingImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {existingImages.map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt="Product"
                                className={`w-full h-20 object-cover rounded ${image.isMain ? 'ring-2 ring-indigo-500' : ''}`}
                              />
                              <div className="absolute top-0 left-0 right-0 flex justify-between">
                                <span className={`${image.isMain ? 'bg-indigo-500' : 'bg-gray-500'} text-white text-xs px-1 rounded-br`}>
                                  {image.isMain ? 'Main' : ''}
                                </span>
                                {!image.isMain && currentProduct && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await adminProductsApi.setMainImage(currentProduct.id, image.id);
                                        // updates local state to reflect the change
                                        setExistingImages(existingImages.map(img => ({
                                          ...img,
                                          isMain: img.id === image.id
                                        })));
                                      } catch (err) {
                                        console.error("Failed to set main image:", err);
                                        setError("Failed to set as main image.");
                                      }
                                    }}
                                    className="bg-indigo-500 text-white text-xs px-1 rounded-bl"
                                  >
                                    Set Main
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setExistingImages(existingImages.filter(img => img.id !== image.id));
                                  setImagesToDelete([...imagesToDelete, image.id]);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Images Preview */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className={`w-full h-20 object-cover rounded ${index === 0 ? 'ring-2 ring-indigo-500' : ''}`}
                              />
                              {index === 0 && (
                                <span className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-1 rounded-br">
                                  Main
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          The first image will be set as the main product image if no main image exists.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  {/* Upload Progress Bar - Only show when uploading */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Uploading images... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Reset states
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedImages([]);
                      setImagePreviewUrls([]);
                      setExistingImages([]);
                      setImagesToDelete([]);
                      setError(null);
                      setUploadProgress(0);
                      
                      // Clean up image preview URLs to prevent memory leaks
                      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    {showCreateModal ? 'Create Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
