import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import Dashboard from '../components/admin/Dashboard'
import ProductManagement from '../components/admin/ProductManagement'
import OrderManagement from '../components/admin/OrderManagement'
import CategoryManagement from '../components/admin/CategoryManagement'
import { AdminLogin } from '../components/admin/AdminLogin'
import ProtectedAdminRoute from '../components/admin/ProtectedAdminRoute'
import { useAdminAuth } from '../hooks/useAdminAuth'

const AdminRoutes = () => {
  const { isAuthenticated, isLoading } = useAdminAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin />
      } />
      
      <Route path="/" element={
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        {/* Add more admin routes as needed */}
      </Route>
      
      {/* Fallback route for any unmatched admin paths */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}

export default AdminRoutes
