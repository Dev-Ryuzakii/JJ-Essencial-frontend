import { get, post, put, del } from './apiClient'

// Address structure
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
  createdAt: string
  updatedAt: string
}

// Create address request
export interface CreateAddressData {
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
  isDefault?: boolean
}

// Update address request
export interface UpdateAddressData {
  type?: 'SHIPPING' | 'BILLING' | 'BOTH'
  firstName?: string
  lastName?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  phone?: string
  isDefault?: boolean
}

const addressesApi = {
  /**
   * Get user addresses
   * GET /api/v1/users/addresses
   */
  getAddresses: async (): Promise<Address[]> => {
    const response = await get<Address[]>('/users/addresses')
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to get addresses')
    }
  },

  /**
   * Get address by ID
   * GET /api/v1/users/addresses/:id
   */
  getAddress: async (id: string): Promise<Address> => {
    const response = await get<Address>(`/users/addresses/${id}`)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to get address')
    }
  },

  /**
   * Create new address
   * POST /api/v1/users/addresses
   */
  createAddress: async (data: CreateAddressData): Promise<Address> => {
    const response = await post<Address>('/users/addresses', data)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to create address')
    }
  },

  /**
   * Update address
   * PUT /api/v1/users/addresses/:id
   */
  updateAddress: async (id: string, data: UpdateAddressData): Promise<Address> => {
    const response = await put<Address>(`/users/addresses/${id}`, data)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to update address')
    }
  },

  /**
   * Delete address
   * DELETE /api/v1/users/addresses/:id
   */
  deleteAddress: async (id: string): Promise<void> => {
    const response = await del<null>(`/users/addresses/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete address')
    }
  },

  /**
   * Set address as default
   * PATCH /api/v1/users/addresses/:id/default
   */
  setDefaultAddress: async (id: string): Promise<Address> => {
    const response = await post<Address>(`/users/addresses/${id}/default`, {})
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to set default address')
    }
  }
}

export default addressesApi
