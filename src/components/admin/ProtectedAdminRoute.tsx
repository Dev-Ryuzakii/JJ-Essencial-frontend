import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

interface ProtectedAdminRouteProps {
  children?: React.ReactNode
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-t-2 border-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
