import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showFooter = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      {/* Toast notifications */}
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
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  )
}
