import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import authApi from '../services/authApi'
import toast from 'react-hot-toast'

interface DecodedToken {
  exp: number
  sub: string // userId - modern JWT standard uses 'sub' for subject
  role: string
  fullName?: string
  email?: string
}

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const token = localStorage.getItem('adminToken')
    const adminUserData = localStorage.getItem('adminUser')
    
    if (!token || !adminUserData) {
      setIsAuthenticated(false)
      setAdminUser(null)
      setIsLoading(false)
      return
    }
    
    try {
      const decodedToken = jwtDecode<DecodedToken>(token)
      const user = JSON.parse(adminUserData)
      
      // Check if token is expired
      if (decodedToken.exp * 1000 < Date.now()) {
        // Token expired
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setIsAuthenticated(false)
        setAdminUser(null)
        toast.error('Your session has expired. Please log in again.')
      } else if (decodedToken.role !== 'ADMIN') {
        // Not an admin token
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setIsAuthenticated(false)
        setAdminUser(null)
        toast.error('Unauthorized access. Admin privileges required.')
      } else {
        // Valid token
        setIsAuthenticated(true)
        setAdminUser(user)
      }
    } catch (error) {
      // Invalid token
      console.error('Token validation error:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
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
      
      // Use the normal signin method
      const authData = await authApi.signin({ email, password })
      
      // Verify that the user has admin role
      if (authData.user.role !== 'ADMIN') {
        toast.error('Access denied. Admin privileges required.')
        await authApi.signout(); // Clean up if not admin
        return false
      }
      
      // Store user data in state - localStorage is handled by the API service
      setIsAuthenticated(true)
      setAdminUser({
        ...authData.user,
        isActive: true,
        phone: null,
        avatar: null,
        dateOfBirth: null
      })
      
      toast.success('Logged in successfully')
      return true
    } catch (error: any) {
      console.error('Admin login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Handle standard API error format
      if (error.success === false) {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authApi.signout() // Use the normal signout method
    setIsAuthenticated(false)
    setAdminUser(null)
    toast.success('Logged out successfully')
  }

  return {
    isAuthenticated,
    isLoading,
    adminUser,
    user: adminUser, // For backward compatibility
    login,
    logout,
    checkAuthStatus
  }
}

export default useAdminAuth
