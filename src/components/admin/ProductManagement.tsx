import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Filter, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  RefreshCw, 
  X,
  ChevronUp,
  ChevronDown,
  Check,
  Package
} from 'lucide-react'
import productsApi, { Product, ProductFilter, ProductCategory } from '../../services/productsApi'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ProductFilter>({
    status: undefined,
    inStock: undefined,
    featured: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    categoryId: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    sku: '',
    quantity: 0,
    categoryId: '',
    featured: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  })

  const [categories, setCategories] = useState<ProductCategory[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [page, filters])

  const fetchCategories = async () => {
    try {
      const response = await productsApi.getCategories()
      setCategories(response.items || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filterParams = {
        ...filters,
        search: searchTerm || undefined,
        page,
        limit: 10
      }
      
      const response = await productsApi.getProducts(filterParams)
      
      setProducts(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (err) {
      setError('Failed to fetch products. Please try again.')
      console.error('Error fetching products:', err)
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
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFilters({
        ...filters,
        [name]: checkbox.checked
      })
    } else {
      setFilters({
        ...filters,
        [name]: value === '' ? undefined : value
      })
    }
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
    // Reset form data
    setProductFormData({
      name: '',
      description: '',
      price: 0,
      salePrice: 0,
      sku: '',
      quantity: 0,
      categoryId: '',
      featured: false,
      status: 'ACTIVE'
    })
    setShowCreateModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || 0,
      sku: product.sku,
      quantity: product.quantity,
      categoryId: product.categoryId || '',
      featured: product.featured || false,
      status: product.status
    })
    setShowEditModal(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productsApi.deleteProduct(productId)
      setProducts(products.filter(product => product.id !== productId))
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) return
    
    try {
      await productsApi.bulkDeleteProducts(selectedProducts)
      setProducts(products.filter(product => !selectedProducts.includes(product.id)))
      setSelectedProducts([])
    } catch (err) {
      console.error('Error deleting products:', err)
      setError('Failed to delete products. Please try again.')
    }
  }

  const handleBulkUpdate = async (status: 'ACTIVE' | 'INACTIVE' | 'DRAFT') => {
    if (selectedProducts.length === 0) return
    
    try {
      await productsApi.bulkUpdateProducts(selectedProducts, { status })
      fetchProducts()
      setSelectedProducts([])
    } catch (err) {
      console.error('Error updating products:', err)
      setError('Failed to update products. Please try again.')
    }
  }

  const handleSubmitProductForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (showCreateModal) {
        await productsApi.createProduct(productFormData)
      } else if (showEditModal && currentProduct) {
        await productsApi.updateProduct(currentProduct.id, productFormData)
      }
      
      fetchProducts()
      setShowCreateModal(false)
      setShowEditModal(false)
    } catch (err) {
      console.error('Error saving product:', err)
      setError('Failed to save product. Please try again.')
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
    } else if (type === 'number') {
      setProductFormData({
        ...productFormData,
        [name]: parseFloat(value)
      })
    } else {
      setProductFormData({
        ...productFormData,
        [name]: value
      })
    }
  }

  const getStatusBadgeColor = (status: Product['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Management</h1>
        <p className="text-gray-600">Manage your store products</p>
      </div>
      
      {/* Action Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </form>
          
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button
            type="button"
            onClick={() => fetchProducts()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedProducts.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {selectedProducts.length} selected
              </span>
              <button
                type="button"
                onClick={() => handleBulkUpdate('ACTIVE')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Mark Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdate('INACTIVE')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mark Inactive
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleCreateProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                name="status"
                value={filters.status || ''}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                name="categoryId"
                value={filters.categoryId || ''}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  id="sort-by"
                  name="sortBy"
                  value={filters.sortBy || 'createdAt'}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="quantity">Stock</option>
                </select>
                <select
                  name="sortOrder"
                  value={filters.sortOrder || 'desc'}
                  onChange={handleFilterChange}
                  className="block w-32 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                id="min-price"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handleFilterChange}
                placeholder="0.00"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            
            <div>
              <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                id="max-price"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handleFilterChange}
                placeholder="999.99"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="flex items-center h-10 space-x-4">
                <div className="flex items-center">
                  <input
                    id="in-stock-filter"
                    name="inStock"
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="in-stock-filter" className="ml-2 block text-sm text-gray-700">
                    In Stock Only
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="featured-filter"
                    name="featured"
                    type="checkbox"
                    checked={filters.featured || false}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured-filter" className="ml-2 block text-sm text-gray-700">
                    Featured Only
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setFilters({
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })
                setSearchTerm('')
              }}
              className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFilters(false)
                setPage(1)
                fetchProducts()
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading products...</span>
          </div>
        ) : error ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchProducts()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 flex flex-col justify-center items-center">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500 mb-4">
              {Object.values(filters).some(value => value !== undefined) || searchTerm
                ? 'Try adjusting your filters to see more results'
                : 'Create your first product to get started'}
            </p>
            {(Object.values(filters).some(value => value !== undefined) || searchTerm) ? (
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  })
                  setSearchTerm('')
                  fetchProducts()
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateProduct}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
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
                {products.map((product) => (
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
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.images?.[0] || 'https://via.placeholder.com/40'}
                            alt={product.name}
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
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      {product.salePrice && (
                        <div className="text-sm text-red-600">${product.salePrice.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.quantity > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {product.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(product.status)}`}>
                        {product.status}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && products.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUp className="h-5 w-5 rotate-90" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow = page - 2 + i;
                    if (page < 3) {
                      pageToShow = i + 1;
                    } else if (page > totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    }
                    
                    if (pageToShow > 0 && pageToShow <= totalPages) {
                      return (
                        <button
                          key={pageToShow}
                          onClick={() => setPage(pageToShow)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageToShow
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageToShow}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Create/Edit Product Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
          }}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitProductForm}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {showCreateModal ? 'Create New Product' : 'Edit Product'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name *
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
                          Price *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₦</span>
                          </div>
                          <input
                            type="number"
                            name="price"
                            id="price"
                            required
                            min="0"
                            step="0.01"
                            value={productFormData.price}
                            onChange={handleProductFormChange}
                            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                          Sale Price
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₦</span>
                          </div>
                          <input
                            type="number"
                            name="salePrice"
                            id="salePrice"
                            min="0"
                            step="0.01"
                            value={productFormData.salePrice}
                            onChange={handleProductFormChange}
                            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                          SKU *
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
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          id="quantity"
                          required
                          min="0"
                          value={productFormData.quantity}
                          onChange={handleProductFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        name="categoryId"
                        id="categoryId"
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
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <select
                        name="status"
                        id="status"
                        required
                        value={productFormData.status}
                        onChange={handleProductFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="featured"
                        name="featured"
                        type="checkbox"
                        checked={productFormData.featured}
                        onChange={handleProductFormChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                        Featured Product
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {showCreateModal ? 'Create Product' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
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
