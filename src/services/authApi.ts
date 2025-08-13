import { post, get, put } from './apiClient'

/**
 * Updated DTOs matching the new API documentation structure
 */

// User profile response structure
export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

// Authentication response structure
export interface AuthResponse {
  user: UserProfile
  accessToken: string
  refreshToken: string
}

// Registration data
export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

// Login data
export interface LoginData {
  email: string
  password: string
}

// Profile update data (multipart form)
export interface ProfileUpdateData {
  fullName?: string
  phone?: string
  dateOfBirth?: string
  avatar?: File
}

const authApi = {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/auth/register', data)
    
    if (response.success && response.data) {
      // Save token and user in localStorage
      localStorage.setItem('userToken', response.data.accessToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('refreshToken', response.data.refreshToken)
      
      return response.data
    } else {
      throw new Error(response.message || 'Registration failed')
    }
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/auth/login', data)
    
    if (response.success && response.data) {
      // Save token and user in localStorage
      localStorage.setItem('userToken', response.data.accessToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('refreshToken', response.data.refreshToken)
      
      return response.data
    } else {
      throw new Error(response.message || 'Login failed')
    }
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken
    })
    
    if (response.success && response.data) {
      // Update tokens in localStorage
      localStorage.setItem('userToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      
      return response.data
    } else {
      throw new Error(response.message || 'Token refresh failed')
    }
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await post('/auth/logout', {})
    } finally {
      // Always clear localStorage regardless of API response
      localStorage.removeItem('userToken')
      localStorage.removeItem('user')
      localStorage.removeItem('refreshToken')
    }
  },

  /**
   * Get current user profile
   * GET /api/v1/users/profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await get<UserProfile>('/users/profile')
    
    if (response.success && response.data) {
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } else {
      throw new Error(response.message || 'Failed to get profile')
    }
  },

  /**
   * Update user profile with optional avatar upload
   * PUT /api/v1/users/profile
   */
  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const formData = new FormData()
    
    if (data.fullName) formData.append('fullName', data.fullName)
    if (data.phone) formData.append('phone', data.phone)
    if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth)
    if (data.avatar) formData.append('avatar', data.avatar)

    const response = await put<UserProfile>('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.success && response.data) {
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } else {
      throw new Error(response.message || 'Failed to update profile')
    }
  },

  /**
   * Admin login
   * POST /api/v1/auth/admin/login
   */
  adminLogin: async (data: LoginData): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/auth/admin/login', data)
    
    if (response.success && response.data) {
      // Save admin token and user in localStorage
      localStorage.setItem('adminToken', response.data.accessToken)
      localStorage.setItem('adminUser', JSON.stringify(response.data.user))
      localStorage.setItem('adminRefreshToken', response.data.refreshToken)
      
      return response.data
    } else {
      throw new Error(response.message || 'Admin login failed')
    }
  },

  /**
   * Password reset functionality
   * POST /api/v1/auth/reset-password  
   */
  resetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await post<{ message: string }>('/auth/reset-password', { email })
    if (response.success) {
      return { message: response.message }
    } else {
      throw new Error(response.message || 'Password reset request failed')
    }
  },

  /**
   * Update password with token
   * POST /api/v1/auth/update-password
   */
  updatePassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await post<{ message: string }>(`/auth/update-password?token=${token}`, { 
      password: newPassword 
    })
    if (response.success) {
      return { message: response.message }
    } else {
      throw new Error(response.message || 'Password update failed')
    }
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem('userToken') !== null
  },

  /**
   * Check if admin is logged in
   */
  isAdminAuthenticated: (): boolean => {
    return localStorage.getItem('adminToken') !== null
  },

  /**
   * Get current user data from localStorage
   */
  getUser: (): UserProfile | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Get current admin user data from localStorage
   */
  getAdminUser: (): UserProfile | null => {
    const adminUser = localStorage.getItem('adminUser')
    return adminUser ? JSON.parse(adminUser) : null
  },

  /**
   * Logout admin
   */
  adminLogout: (): void => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminRefreshToken')
  }
}

export default authApi
