import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  Star,
  MessageCircle,
  TrendingUp,
  Users
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, cn } from '../lib/utils'
import toast from 'react-hot-toast'

interface TradeItem {
  id: string
  title: string
  description: string
  category: string
  condition: 'new' | 'like-new' | 'good' | 'fair'
  estimatedValue: number
  desiredItems?: string[]
  images: string[]
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  views: number
  interests: number
  user: {
    id: string
    name: string
    avatar?: string
    rating: number
    totalTrades: number
  }
}

interface TradeOffer {
  id: string
  fromUser: {
    id: string
    name: string
    avatar?: string
    rating: number
  }
  toUser: {
    id: string
    name: string
    avatar?: string
    rating: number
  }
  offeredItems: {
    id: string
    title: string
    estimatedValue: number
    images: string[]
  }[]
  requestedItems: {
    id: string
    title: string
    estimatedValue: number
    images: string[]
  }[]
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: string
}

const Trades: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-items' | 'offers' | 'completed'>('browse')
  const [tradeItems, setTradeItems] = useState<TradeItem[]>([])
  const [myItems, setMyItems] = useState<TradeItem[]>([])
  const [offers, setOffers] = useState<TradeOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const categories = [
    'Cookware',
    'Bakeware',
    'Tableware',
    'Kitchen Appliances',
    'Cutlery',
    'Storage',
    'Coffee & Tea',
    'Bar Tools',
    'Decorative Items'
  ]

  const conditions = [
    { value: 'new', label: 'New', color: 'success' },
    { value: 'like-new', label: 'Like New', color: 'primary' },
    { value: 'good', label: 'Good', color: 'warning' },
    { value: 'fair', label: 'Fair', color: 'gray' }
  ]

  useEffect(() => {
    loadTradeData()
  }, [])

  const loadTradeData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockTradeItems: TradeItem[] = [
        {
          id: '1',
          title: 'Premium Cast Iron Skillet Set',
          description: 'Professional grade cast iron skillets, barely used. Perfect for serious cooking.',
          category: 'Cookware',
          condition: 'like-new',
          estimatedValue: 150000,
          desiredItems: ['High-end blender', 'Stand mixer', 'Pressure cooker'],
          images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          views: 47,
          interests: 8,
          user: {
            id: 'user1',
            name: 'John Smith',
            avatar: '/api/placeholder/40/40',
            rating: 4.8,
            totalTrades: 12
          }
        },
        {
          id: '2',
          title: 'Vintage Copper Pots Collection',
          description: 'Beautiful vintage copper pots and pans collection. Some patina but fully functional.',
          category: 'Cookware',
          condition: 'good',
          estimatedValue: 200000,
          desiredItems: ['Modern non-stick set', 'Kitchen island accessories'],
          images: ['/api/placeholder/300/300'],
          status: 'active',
          createdAt: '2024-01-14T15:20:00Z',
          updatedAt: '2024-01-14T15:20:00Z',
          views: 23,
          interests: 5,
          user: {
            id: 'user2',
            name: 'Sarah Johnson',
            avatar: '/api/placeholder/40/40',
            rating: 4.9,
            totalTrades: 8
          }
        }
      ]

      const mockOffers: TradeOffer[] = [
        {
          id: '1',
          fromUser: {
            id: 'user3',
            name: 'Mike Wilson',
            avatar: '/api/placeholder/40/40',
            rating: 4.7
          },
          toUser: {
            id: 'current-user',
            name: 'You',
            rating: 4.5
          },
          offeredItems: [{
            id: '1',
            title: 'KitchenAid Stand Mixer',
            estimatedValue: 120000,
            images: ['/api/placeholder/200/200']
          }],
          requestedItems: [{
            id: '2',
            title: 'Your Cast Iron Set',
            estimatedValue: 150000,
            images: ['/api/placeholder/200/200']
          }],
          message: 'Hi! I\'d love to trade my barely used KitchenAid mixer for your cast iron set. Let me know if you\'re interested!',
          status: 'pending',
          createdAt: '2024-01-16T09:15:00Z'
        }
      ]

      setTradeItems(mockTradeItems)
      setMyItems(mockTradeItems.slice(0, 1)) // Simulate user's items
      setOffers(mockOffers)
    } catch (error) {
      console.error('Failed to load trade data:', error)
      toast.error('Failed to load trade data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'success' as const, label: 'Active' },
      pending: { color: 'warning' as const, label: 'Pending' },
      completed: { color: 'primary' as const, label: 'Completed' },
      cancelled: { color: 'error' as const, label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <Badge variant={config.color} size="sm">{config.label}</Badge>
  }

  const getConditionBadge = (condition: string) => {
    const conditionConfig = conditions.find(c => c.value === condition) || conditions[0]
    return <Badge variant={conditionConfig.color as any} size="sm">{conditionConfig.label}</Badge>
  }

  const filteredItems = tradeItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesCondition = !selectedCondition || item.condition === selectedCondition
    
    return matchesSearch && matchesCategory && matchesCondition
  })

  const handleCreateListing = () => {
    toast('Trade listing creation coming soon!', { icon: '🚧' })
  }

  const handleMakeOffer = (itemId: string) => {
    toast(`Making offer for item ${itemId} - Feature coming soon!`, { icon: '🚧' })
  }

  const handleOfferResponse = (offerId: string, action: 'accept' | 'reject') => {
    toast(`${action === 'accept' ? 'Accepting' : 'Rejecting'} offer ${offerId} - Feature coming soon!`, { icon: '🚧' })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Trade Your Kitchen Items</h1>
            <p className="text-xl text-green-100 mb-8">
              Exchange your unused kitchen equipment with other cooking enthusiasts. 
              Give your items a new life while discovering new tools for your culinary journey.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Sustainable Trading</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Trusted Community</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Rated Exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                {[
                  { key: 'browse', label: 'Browse Items', icon: Search, count: filteredItems.length },
                  { key: 'my-items', label: 'My Items', icon: Package, count: myItems.length },
                  { key: 'offers', label: 'Offers', icon: MessageCircle, count: offers.filter(o => o.status === 'pending').length },
                  { key: 'completed', label: 'Completed', icon: CheckCircle, count: 0 }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2',
                      activeTab === tab.key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="primary" size="sm">{tab.count}</Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'browse' && (
                <div className="space-y-6">
                  {/* Header and Create Button */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse Trade Items</h2>
                      <p className="text-gray-600">Discover kitchen items available for trade</p>
                    </div>
                    <Button onClick={handleCreateListing} className="mt-4 lg:mt-0">
                      <Plus className="w-4 h-4 mr-2" />
                      List an Item
                    </Button>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>

                      <select
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Conditions</option>
                        {conditions.map((condition) => (
                          <option key={condition.value} value={condition.value}>{condition.label}</option>
                        ))}
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="value-high">Highest Value</option>
                        <option value="value-low">Lowest Value</option>
                        <option value="popular">Most Popular</option>
                      </select>
                    </div>
                  </div>

                  {/* Items Grid */}
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                      <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                      <Button onClick={handleCreateListing}>
                        <Plus className="w-4 h-4 mr-2" />
                        Be the first to list an item
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img
                              src={item.images[0] || '/api/placeholder/300/200'}
                              alt={item.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-4 left-4">
                              {getConditionBadge(item.condition)}
                            </div>
                            <div className="absolute top-4 right-4">
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                            
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-medium text-green-600">
                                Est. Value: {formatCurrency(item.estimatedValue)}
                              </span>
                              <span className="text-sm text-gray-500">{item.category}</span>
                            </div>

                            {item.desiredItems && item.desiredItems.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Looking for:</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.desiredItems.slice(0, 2).map((desired, index) => (
                                    <Badge key={index} variant="gray" size="sm">{desired}</Badge>
                                  ))}
                                  {item.desiredItems.length > 2 && (
                                    <Badge variant="gray" size="sm">+{item.desiredItems.length - 2} more</Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={item.user.avatar || '/api/placeholder/24/24'}
                                  alt={item.user.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-sm text-gray-600">{item.user.name}</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-500">{item.user.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{item.views}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{item.interests}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button size="sm" className="flex-1" onClick={() => handleMakeOffer(item.id)}>
                                Make Offer
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'my-items' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">My Trade Items</h2>
                      <p className="text-gray-600">Manage your listed items and track their performance</p>
                    </div>
                    <Button onClick={handleCreateListing}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Item
                    </Button>
                  </div>

                  {myItems.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed</h3>
                      <p className="text-gray-600 mb-6">Start trading by listing your first item</p>
                      <Button onClick={handleCreateListing}>
                        <Plus className="w-4 h-4 mr-2" />
                        List Your First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-start space-x-6">
                            <img
                              src={item.images[0] || '/api/placeholder/120/120'}
                              alt={item.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(item.status)}
                                  {getConditionBadge(item.condition)}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{item.description}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Est. Value</p>
                                  <p className="text-green-600 font-semibold">{formatCurrency(item.estimatedValue)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Views</p>
                                  <p className="text-gray-900">{item.views}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Interests</p>
                                  <p className="text-gray-900">{item.interests}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Listed</p>
                                  <p className="text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Offers ({item.interests})
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'offers' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade Offers</h2>
                    <p className="text-gray-600">Review and respond to trade offers</p>
                  </div>

                  {offers.length === 0 ? (
                    <div className="text-center py-16">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
                      <p className="text-gray-600">When someone is interested in your items, offers will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {offers.map((offer) => (
                        <div key={offer.id} className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={offer.fromUser.avatar || '/api/placeholder/40/40'}
                                alt={offer.fromUser.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">{offer.fromUser.name}</h3>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600">{offer.fromUser.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(offer.status)}
                              <span className="text-sm text-gray-500">
                                {new Date(offer.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {offer.message && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <p className="text-gray-700">{offer.message}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">They're Offering:</h4>
                              <div className="space-y-3">
                                {offer.offeredItems.map((item) => (
                                  <div key={item.id} className="flex items-center space-x-3">
                                    <img
                                      src={item.images[0] || '/api/placeholder/60/60'}
                                      alt={item.title}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900">{item.title}</p>
                                      <p className="text-sm text-green-600">{formatCurrency(item.estimatedValue)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">For Your:</h4>
                              <div className="space-y-3">
                                {offer.requestedItems.map((item) => (
                                  <div key={item.id} className="flex items-center space-x-3">
                                    <img
                                      src={item.images[0] || '/api/placeholder/60/60'}
                                      alt={item.title}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900">{item.title}</p>
                                      <p className="text-sm text-green-600">{formatCurrency(item.estimatedValue)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {offer.status === 'pending' && (
                            <div className="flex space-x-3">
                              <Button onClick={() => handleOfferResponse(offer.id, 'accept')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Offer
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleOfferResponse(offer.id, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                              <Button variant="outline">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed trades yet</h3>
                  <p className="text-gray-600">Your completed trades will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How Kitchen Trading Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. List Your Item</h3>
                <p className="text-gray-600 text-sm">Upload photos and describe what you want to trade</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Browse & Offer</h3>
                <p className="text-gray-600 text-sm">Find items you want and make trade offers</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Negotiate</h3>
                <p className="text-gray-600 text-sm">Chat with other traders to agree on terms</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Exchange</h3>
                <p className="text-gray-600 text-sm">Complete the trade and rate your experience</p>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Trading Safety Tips</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Always inspect items before completing the trade</li>
                  <li>• Meet in public places for exchanges</li>
                  <li>• Check trader ratings and reviews</li>
                  <li>• Use our messaging system for communication</li>
                  <li>• Report any suspicious activity to our team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trades
