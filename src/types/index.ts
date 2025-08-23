// User types
export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  avatar?: string
  dateOfBirth?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalOrders: number
  pendingOrders: number
  totalSpent: string
  wishlists: number
  reviews: number
}

export interface Address {
  id: string
  type: 'SHIPPING' | 'BILLING' | 'BOTH'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: string
  discountPrice?: string
  stock: number
  stockQuantity?: number // Backend field
  images: string[]
  category: Category
  features?: string[]
  specifications?: Record<string, any>
  averageRating: number
  reviewCount: number
  isFeatured?: boolean // Backend field
  isInWishlist?: boolean // Frontend field
  featured?: boolean // Backend field
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  productCount: number
  createdAt: string
  updatedAt: string
}

// Order types
export interface Order {
  id: string
  status: OrderStatus
  totalAmount: string
  items: OrderItem[]
  address: Address
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentDetails?: PaymentDetails
  tracking?: OrderTracking
  notes?: string
  user?: User
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: string
  totalPrice: string
  product?: Product
}

export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED'

export type PaymentMethod = 'PAYSTACK' | 'FLUTTERWAVE' | 'BANK_TRANSFER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface PaymentDetails {
  reference: string
  amount: string
  gateway: PaymentMethod
  gatewayResponse?: string
  paidAt?: string
}

export interface OrderTracking {
  updates: TrackingUpdate[]
}

export interface TrackingUpdate {
  status: string
  timestamp: string
  message: string
}

// Payment types
export interface PaymentInitiation {
  reference: string
  authorization_url: string
  access_code: string
}

export interface BankTransferDetails {
  orderId: string
  reference: string
  amount: string
  bankAccounts: BankAccount[]
  instructions: string
  expiresAt: string
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  accountName: string
}

export interface PaymentReceipt {
  id: string
  reference: string
  fileUrl: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  order?: Order
  notes?: string
  createdAt: string
  verifiedAt?: string
}

// Trade types
export interface Trade {
  id: string
  status: TradeStatus
  product: Product
  seller: User
  price: string
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export type TradeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD'

// Wishlist types
export interface WishlistItem {
  id: string
  product: Product
  createdAt: string
}

// Review types
export interface Review {
  id: string
  rating: number
  comment: string
  images?: string[]
  product?: Product
  user?: User
  verified: boolean
  createdAt: string
  updatedAt: string
}

// Support types
export interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  order?: Order
  messages: TicketMessage[]
  lastActivity: string
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  message: string
  isAdmin: boolean
  createdAt: string
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

// Search types
export interface SearchSuggestion {
  term: string
  frequency: number
}

export interface TrendingProduct {
  id: string
  name: string
  price: string
  discountPrice?: string
  image: string
  viewCount: number
  orderCount: number
}

export interface SimilarProduct {
  id: string
  name: string
  price: string
  discountPrice?: string
  image: string
  category: Category
  similarity: number
}

// Analytics types (Admin)
export interface SalesAnalytics {
  totalSales: string
  orderCount: number
  averageOrderValue: string
  periodComparison: {
    percentChange: number
    previousPeriodSales: string
  }
  timeline: SalesTimelineItem[]
  paymentMethods: PaymentMethodStats[]
}

export interface SalesTimelineItem {
  date: string
  sales: string
  orders: number
}

export interface PaymentMethodStats {
  method: PaymentMethod
  count: number
  amount: string
}

export interface ProductAnalytics {
  topSelling: TopSellingProduct[]
  lowStock: LowStockProduct[]
  categoryBreakdown: CategoryStats[]
  mostViewed: MostViewedProduct[]
}

export interface TopSellingProduct {
  id: string
  name: string
  quantity: number
  revenue: string
}

export interface LowStockProduct {
  id: string
  name: string
  stock: number
  threshold: number
}

export interface CategoryStats {
  category: string
  count: number
  revenue: string
}

export interface MostViewedProduct {
  id: string
  name: string
  views: number
}

export interface CustomerAnalytics {
  newCustomers: number
  activeCustomers: number
  topCustomers: TopCustomer[]
  customerRetention: {
    rate: number
    returningCustomers: number
  }
  timeline: CustomerTimelineItem[]
}

export interface TopCustomer {
  id: string
  fullName: string
  orderCount: number
  totalSpent: string
}

export interface CustomerTimelineItem {
  date: string
  newCustomers: number
  activeCustomers: number
}

export interface InventoryAnalytics {
  totalProducts: number
  totalValue: string
  lowStockCount: number
  outOfStockCount: number
  stockMovement: {
    added: number
    sold: number
    returned: number
  }
  mostMoving: FastMovingProduct[]
}

export interface FastMovingProduct {
  id: string
  name: string
  turnoverRate: number
}

// Common types
export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string  // IMPORTANT: This will be mapped to 'name' when sending to backend
  phone?: string    // IMPORTANT: This should be excluded when sending to backend
}

export interface ResetPasswordFormData {
  email: string
}

export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  discountPrice?: number
  stock: number
  categoryId: string
  images: string[]
  features: string[]
  specifications: Record<string, any>
}

export interface CategoryFormData {
  name: string
  description?: string
  image?: string
  parentId?: string
}

export interface AddressFormData {
  type: 'SHIPPING' | 'BILLING' | 'BOTH'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface ReviewFormData {
  productId: string
  rating: number
  comment: string
  images?: string[]
}

export interface TradeFormData {
  productId: string
  price: number
  description: string
  images: string[]
}

export interface SupportTicketFormData {
  subject: string
  message: string
  orderId?: string
  priority: TicketPriority
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  name: string
  price: string
  discountPrice?: string
  image: string
  quantity: number
  stock: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  discountAmount: number
  finalAmount: number
}

// Filter types
export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
  featured?: boolean
  inStock?: boolean
}

export interface OrderFilters {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  userId?: string
}

export interface TradeFilters {
  status?: TradeStatus
  category?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<any>
  children?: NavItem[]
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}
