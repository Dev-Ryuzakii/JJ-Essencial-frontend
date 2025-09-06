import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import OrderConfirmation from './pages/OrderConfirmation'
import BankTransferCheckoutPage from './pages/BankTransferCheckoutPage'
import Wishlist from './pages/Wishlist'
import Categories from './pages/Categories'
import Search from './pages/Search'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import AdminLoginTest from './pages/AdminLoginTest'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

// Conditional imports based on environment variables
const TradeRoutes = import.meta.env.VITE_ENABLE_TRADES === 'true' 
  ? React.lazy(() => import('./pages/Trades'))
  : null

// Enable admin routes by default for development
const AdminRoutes = React.lazy(() => import('./routes/AdminRoutes'))

function App() {
  return (
    <div className="App">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/search" element={<Layout><Search /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Cart Routes (accessible to all) */}
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Layout><Checkout /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/checkout/payment" element={
            <ProtectedRoute>
              <Layout><BankTransferCheckoutPage /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout><Orders /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders/confirmation" element={
            <ProtectedRoute>
              <Layout><OrderConfirmation /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <Layout><OrderDetail /></Layout>
            </ProtectedRoute>
          } />

          {/* Conditional Routes */}
          {import.meta.env.VITE_ENABLE_WISHLIST === 'true' && (
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Layout><Wishlist /></Layout>
              </ProtectedRoute>
            } />
          )}

          {/* Trade Routes */}
          {TradeRoutes && (
            <Route path="/trades" element={
              <ProtectedRoute>
                <Layout>
                  <React.Suspense fallback={<div className="flex justify-center py-8">Loading...</div>}>
                    <TradeRoutes />
                  </React.Suspense>
                </Layout>
              </ProtectedRoute>
            } />
          )}

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <React.Suspense fallback={<div className="flex justify-center py-8">Loading...</div>}>
              <AdminRoutes />
            </React.Suspense>
          } />

          {/* Legal Pages */}
          <Route path="/privacy" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Privacy Policy</h1><p>Privacy policy content...</p></div></Layout>} />
          <Route path="/terms" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Terms of Service</h1><p>Terms of service content...</p></div></Layout>} />
          <Route path="/cookies" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Cookie Policy</h1><p>Cookie policy content...</p></div></Layout>} />
          <Route path="/refund-policy" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Refund Policy</h1><p>Refund policy content...</p></div></Layout>} />
          
          {/* Help & Support Pages */}
          <Route path="/help" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Help Center</h1><p>Help content...</p></div></Layout>} />
          <Route path="/shipping" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Shipping Information</h1><p>Shipping info...</p></div></Layout>} />
          <Route path="/returns" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Returns & Exchanges</h1><p>Returns info...</p></div></Layout>} />
          <Route path="/track-order" element={<Layout><div className="container mx-auto px-4 py-8"><h1>Track Your Order</h1><p>Order tracking...</p></div></Layout>} />
          <Route path="/faq" element={<Layout><div className="container mx-auto px-4 py-8"><h1>FAQ</h1><p>Frequently asked questions...</p></div></Layout>} />

          {/* Legacy redirects */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          
          {/* Admin login should not be redirected */}
          <Route path="/admin-login-test" element={<Layout><AdminLoginTest /></Layout>} />

          {/* Catch-all Route */}
          <Route path="/404" element={<Layout><NotFound /></Layout>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
  )
}

export default App
