import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ChevronUp,
  ChevronDown,
  Folder
} from 'lucide-react'
import adminCategoriesApi from '../../services/adminCategoriesApi'
import type { AdminCategory } from '../../services/adminCategoriesApi'

export default function CategoryManagement() {
  const [allCategories, setAllCategories] = useState<AdminCategory[]>([]) // Store all categories
  const [categories, setCategories] = useState<AdminCategory[]>([]) // Display categories
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<AdminCategory | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    sortOrder: 0,
    isActive: true
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // updates displayed categories when page or search changes
    updatesDisplayedCategories()
  }, [page, searchTerm, allCategories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Admin categories endpoint - start minimal and add parameters gradually
      const params = {
        // Only include search if provided and not empty
        ...(searchTerm && { search: searchTerm })
        // Remove other parameters temporarily to test basic functionality
        // includeInactive: true,
        // sortBy: 'name',
        // sortOrder: 'ASC' as const
      }
      
      const fetchedCategories = await adminCategoriesApi.getCategories(params)
      
      setAllCategories(fetchedCategories || [])
    } catch (err) {
      setError('Failed to fetch categories. Please try again.')
      console.error('Error fetching categories:', err)
      setAllCategories([])
    } finally {
      setLoading(false)
    }
  }

  const updatesDisplayedCategories = () => {
    // Filter categories based on search term
    let filteredCategories = allCategories
    if (searchTerm) {
      filteredCategories = allCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Implement client-side pagination
    const itemsPerPage = 10
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex)
    
    setCategories(paginatedCategories)
    setTotalPages(Math.ceil(filteredCategories.length / itemsPerPage))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    // updatesDisplayedCategories will be called automatically via useEffect
  }

  const handleSelectAll = () => {
    if (!categories || selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(category => category.id))
    }
  }

  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const handleCreateCategory = () => {
    // Reset form data
    setCategoryFormData({
      name: '',
      description: '',
      parentId: '',
      sortOrder: 0,
      isActive: true
    })
    setSelectedImage(null)
    setImagePreview(null)
    setShowCreateModal(true)
  }

  const handleEditCategory = (category: AdminCategory) => {
    setCurrentCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parent_id || '',
      sortOrder: category.sort_order || 0,
      isActive: category.is_active
    })
    setSelectedImage(null)
    setImagePreview(category.image_url || null)
    setShowEditModal(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    
    try {
      await adminCategoriesApi.deleteCategory(categoryId)
      // Refetch all categories to ensure we have the latest data
      await fetchCategories()
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.length} selected categories?`)) return
    
    try {
      // If there's no bulk delete in the API, we'll need to delete one by one
      await Promise.all(selectedCategories.map(id => adminCategoriesApi.deleteCategory(id)))
      // Refetch all categories to ensure we have the latest data
      await fetchCategories()
      setSelectedCategories([])
    } catch (err) {
      console.error('Error deleting categories:', err)
      setError('Failed to delete categories. Please try again.')
    }
  }

  const handleSubmitCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!categoryFormData.name.trim()) {
      setError('Category name is required')
      return
    }
    
    try {
      // Clean up form data - remove empty strings and convert to proper types
      const cleanFormData = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim() || undefined,
        parentId: categoryFormData.parentId || undefined,
        sortOrder: categoryFormData.sortOrder || undefined,
        isActive: categoryFormData.isActive
      }

      console.log('Sending category data:', cleanFormData)

      if (showCreateModal) {
        // Use the single createCategory method that handles both with/without image
        await adminCategoriesApi.createCategory(cleanFormData, selectedImage || undefined)
        // Refetch all categories to ensure we have the latest data and proper pagination
        await fetchCategories()
        // Reset to page 1 to show the new category
        setPage(1)
      } else if (showEditModal && currentCategory) {
        // Use the single updatesCategory method that handles both with/without image
        await adminCategoriesApi.updatesCategory(currentCategory.id, cleanFormData, selectedImage || undefined)
        // Refetch all categories to ensure we have the latest data
        await fetchCategories()
      }
      
      setShowCreateModal(false)
      setShowEditModal(false)
      setSelectedImage(null)
      setImagePreview(null)
    } catch (err: any) {
      console.error('Error saving category:', err)
      
      // Extract error message from API response
      let errorMessage = 'Failed to save category. Please try again.'
      
      if (err?.message) {
        if (Array.isArray(err.message)) {
          errorMessage = `Validation errors: ${err.message.join(', ')}`
        } else {
          errorMessage = err.message
        }
      } else if (err?.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = `Validation errors: ${err.response.data.message.join(', ')}`
        } else {
          errorMessage = err.response.data.message
        }
      }
      
      setError(errorMessage)
    }
  }

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Handle numeric fields
    if (name === 'sortOrder') {
      setCategoryFormData({
        ...categoryFormData,
        [name]: parseInt(value) || 0
      })
    } else {
      setCategoryFormData({
        ...categoryFormData,
        [name]: value
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // When name changes, generate a slug automatically - removed as admin API handles this

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h1>
        <p className="text-gray-600">Manage your product categories</p>
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
              placeholder="Search categories..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </form>
          
          <button
            type="button"
            onClick={() => fetchCategories()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedCategories.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {selectedCategories.length} selected
              </span>
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
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>
      
      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchCategories()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="py-12 flex flex-col justify-center items-center">
            <Folder className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Try adjusting your search to see more results'
                : 'Create your first category to get started'}
            </p>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  fetchCategories()
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateCategory}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
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
                        checked={categories && selectedCategories.length === categories.length && categories.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(categories || []).map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleSelectCategory(category.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {category.image_url ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={category.image_url}
                              alt={category.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <Folder className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.parent_id ? 
                        allCategories.find(cat => cat.id === category.parent_id)?.name || 'Unknown'
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.sort_order || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.product_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
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
        {!loading && !error && categories && categories.length > 0 && (
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
      
      {/* Create/Edit Category Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedImage(null);
            setImagePreview(null);
          }}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitCategoryForm}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {showCreateModal ? 'Create New Category' : 'Edit Category'}
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
                        value={categoryFormData.name}
                        onChange={handleCategoryFormChange}
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
                        value={categoryFormData.description}
                        onChange={handleCategoryFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Category Image
                      </label>
                      <div className="mt-1">
                        {imagePreview && (
                          <div className="mb-4 relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Category preview"
                              className="h-32 w-32 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          name="image"
                          id="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Upload an image for the category (optional)
                        </p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                        Parent Category
                      </label>
                      <select
                        name="parentId"
                        id="parentId"
                        value={categoryFormData.parentId}
                        onChange={handleCategoryFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">No Parent (Top Level)</option>
                        {allCategories
                          .filter(cat => cat.id !== currentCategory?.id) // Don't allow self as parent
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          name="sortOrder"
                          id="sortOrder"
                          min="0"
                          value={categoryFormData.sortOrder}
                          onChange={handleCategoryFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          name="isActive"
                          id="isActive"
                          value={categoryFormData.isActive.toString()}
                          onChange={(e) => setCategoryFormData({
                            ...categoryFormData,
                            isActive: e.target.value === 'true'
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {showCreateModal ? 'Create Category' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      setSelectedImage(null)
                      setImagePreview(null)
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
