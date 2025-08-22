import { useState, useEffect } from 'react'
import { adminAuthApi } from '../services/authApi'
import toast from 'react-hot-toast'
import { validateAdminToken } from '../utils/adminTokenValidator'
// import useAdminTokenValidation from './useAdminTokenValidation'

interface AdminUser {
  id: string
  email: string
  role: string
  fullName: string
  phone?: string | null
  avatar?: string | null
  dateOfBirth?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const useAdminAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  // Temporarily disabled server-side validation to avoid problematic API calls
  // const { isValidAdmin, isLoading: tokenValidationLoading, adminUser: validatedUser, error, revalidate } = useAdminTokenValidation(token)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem('adminToken')
    const adminUserData = localStorage.getItem('adminUser')
    
    if (!storedToken || !adminUserData) {
      console.log('Admin auth check: No admin token or user data found');
      setIsAuthenticated(false)
      setAdminUser(null)
      setIsLoading(false)
      return
    }
    
    // Client-side token validation first
    const clientValidation = validateAdminToken(storedToken)
    if (!clientValidation.isValid || !clientValidation.isAdmin) {
      console.log('Admin auth check: Invalid admin token:', clientValidation.reason);
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      setToken(null)
      setIsAuthenticated(false)
      setAdminUser(null)
      setIsLoading(false)
      return
    }

    try {
      const user = JSON.parse(adminUserData)
      
      // Check if user has admin role and correct ID
      if (user.role !== 'ADMIN' || user.id !== 'admin-user') {
        console.log('Admin auth check: User is not a valid admin');
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setToken(null)
        setIsAuthenticated(false)
        setAdminUser(null)
        setIsLoading(false)
        return
      }

      // Set authenticated state with full user data
      setToken(storedToken)
      setIsAuthenticated(true)
      setAdminUser({
        ...user,
        fullName: user.fullName || 'Admin User',
        phone: user.phone || null,
        avatar: user.avatar || null,
        dateOfBirth: user.dateOfBirth || null,
        isActive: true,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      })
      
      console.log('Admin auth check: Successfully authenticated from local storage');
      
    } catch (error) {
      console.error('Admin auth validation error:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      setToken(null)
      setIsAuthenticated(false)
      setAdminUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('Admin login attempt with:', { email });
      console.log('Using adminAuthApi.signin from services/authApi - BACKEND ONLY');
      
      // Use dedicated admin signin endpoint - BACKEND ONLY, NO SUPABASE
      const authData = await adminAuthApi.signin({ email, password })
      console.log('Admin login: Backend response received successfully');
      
      // Extract token from response
      const token = authData.access_token
      if (!token) {
        throw new Error('No access token received from server')
      }
      
      // Validate this is actually an admin token
      const tokenValidation = validateAdminToken(token)
      if (!tokenValidation.isValid || !tokenValidation.isAdmin) {
        console.error('Admin login: Invalid admin token received:', tokenValidation.reason);
        toast.error('Invalid admin credentials received')
        return false
      }
      
      // Verify that the user has admin role and correct ID
      if (authData.user.role !== 'ADMIN' || authData.user.id !== 'admin-user') {
        console.error('Admin login: User is not a valid admin:', authData.user);
        toast.error('Access denied. Valid admin account required.')
        return false
      }
      
      // Store token and user data
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(authData.user))
      setToken(token)
      
      console.log('Admin login: Success - user authenticated');
      toast.success('Logged in successfully')
      return true
    } catch (error: any) {
      console.error('Admin login error - BACKEND API CALL FAILED:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Handle different error formats
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Admin login: Error message:', errorMessage);
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await adminAuthApi.signout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear all admin data
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setToken(null)
    setIsAuthenticated(false)
    setAdminUser(null)
    toast.success('Logged out successfully')
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const result = await adminAuthApi.changePassword(currentPassword, newPassword)
      toast.success(result.message)
      return true
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to change password'
      toast.error(errorMessage)
      return false
    }
  }

  return {
    isAuthenticated,
    isLoading,
    adminUser,
    user: adminUser, // For backward compatibility
    login,
    logout,
    changePassword,
    checkAuthStatus
  }
}

export default useAdminAuth
