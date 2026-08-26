import React, { useState, useEffect } from 'react'
import { 
  Search, 
  RefreshCw, 
  Eye,
  Trash2,
  Star,
  MessageSquare,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  AlertTriangle
} from 'lucide-react'
import adminApi, { AdminReviewDto, AdminReviewDetailDto } from '../../services/adminApi'

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<AdminReviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<AdminReviewDetailDto | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Pagination and filters
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')

  // Summary stats
  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    averageRating: '0.0',
    visibleReviews: 0,
    hiddenReviews: 0,
    fiveStarReviews: 0,
    oneStarReviews: 0
  })

  useEffect(() => {
    fetchReviews()
  }, [page, searchTerm, ratingFilter, visibilityFilter, productFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        rating: ratingFilter || undefined,
        isVisible: visibilityFilter === '' ? undefined : visibilityFilter === 'true',
        productId: productFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      }
      
      const response = await adminApi.reviews.getReviews(params)
      setReviews(response.data)
      setTotalPages(response.meta.lastPage)
      setTotalReviews(response.meta.total)
      
      if (response.summary) {
        setReviewSummary(response.summary)
      }
    } catch (err) {
      setError('Failed to fetch reviews. Please try again.')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchReviews()
  }

  const handleViewReview = async (reviewId: string) => {
    try {
      const reviewDetail = await adminApi.reviews.getById(reviewId)
      setSelectedReview(reviewDetail)
      setShowDetailModal(true)
    } catch (err) {
      console.error('Error fetching review details:', err)
      setError('Failed to fetch review details.')
    }
  }

  const handleToggleVisibility = async (review: AdminReviewDto) => {
    try {
      const updatesdReview = await adminApi.reviews.updatesVisibility(review.id, !review.isVisible)
      setReviews(reviews.map(r => 
        r.id === review.id ? { ...r, isVisible: updatesdReview.isVisible } : r
      ))
      fetchReviews() // Refresh to get updatesd summary
    } catch (err) {
      console.error('Error updating review visibility:', err)
      setError('Failed to updates review visibility.')
    }
  }

  const handleDeleteReview = async () => {
    if (!selectedReview) return

    try {
      await adminApi.reviews.delete(selectedReview.id)
      setReviews(reviews.filter(r => r.id !== selectedReview.id))
      setShowDeleteModal(false)
      setSelectedReview(null)
      fetchReviews() // Refresh to get updatesd summary
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Failed to delete review.')
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className={`ml-1 ${size === 'sm' ? 'text-sm' : 'text-base'} text-gray-600`}>
          ({rating})
        </span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Management</h1>
        <p className="text-gray-600">Monitor and moderate customer reviews</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-lg font-semibold text-gray-900">{reviewSummary.totalReviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-lg font-semibold text-yellow-600">{reviewSummary.averageRating}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Visible</p>
              <p className="text-lg font-semibold text-green-600">{reviewSummary.visibleReviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <EyeOff className="h-8 w-8 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hidden</p>
              <p className="text-lg font-semibold text-gray-600">{reviewSummary.hiddenReviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-emerald-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">5-Star</p>
              <p className="text-lg font-semibold text-emerald-600">{reviewSummary.fiveStarReviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">1-Star</p>
              <p className="text-lg font-semibold text-red-600">{reviewSummary.oneStarReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name, product, or review content..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            
            <button
              type="button"
              onClick={() => fetchReviews()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Reviews Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading reviews...</span>
          </div>
        ) : error ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchReviews()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No reviews have been submitted yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {review.user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{review.user.fullName}</div>
                            <div className="text-sm text-gray-500">{review.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="font-medium">{review.product.name}</div>
                          <div className="text-gray-500 truncate">{review.product.category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <p className="line-clamp-3">{truncateText(review.comment, 120)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {review.isVisible ? (
                            <Eye className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-500 mr-1" />
                          )}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            review.isVisible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {review.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => handleViewReview(review.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(review)}
                            className={review.isVisible ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}
                            title={review.isVisible ? 'Hide Review' : 'Show Review'}
                          >
                            {review.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(review as AdminReviewDetailDto)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Review"
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
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * 10, totalReviews)}</span> of{' '}
                    <span className="font-medium">{totalReviews}</span> reviews
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = page - 2 + i
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Review Details</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Review Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(selectedReview.rating, 'md')}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedReview.isVisible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedReview.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-gray-900 text-base leading-relaxed">{selectedReview.comment}</p>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReview.user.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReview.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Product Information</h4>
                  <div className="flex items-start space-x-4">
                    {selectedReview.product.images && selectedReview.product.images.length > 0 && (
                      <img
                        src={selectedReview.product.images[0]}
                        alt={selectedReview.product.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedReview.product.name}</p>
                      <p className="text-sm text-gray-500">{selectedReview.product.category.name}</p>
                      <p className="text-sm text-gray-500">SKU: {selectedReview.product.sku}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                {selectedReview.order && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Order Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Order ID</label>
                        <p className="mt-1 text-sm font-mono text-gray-900">{selectedReview.order.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Order Status</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedReview.order.status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Review Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReview.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last updatesd</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReview.updatesdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => handleToggleVisibility(selectedReview)}
                  className={`px-4 py-2 rounded-md ${
                    selectedReview.isVisible
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedReview.isVisible ? 'Hide Review' : 'Show Review'}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Delete Review</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Customer:</strong> {selectedReview.user.fullName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Product:</strong> {selectedReview.product.name}
                  </p>
                  <div className="mt-2">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
