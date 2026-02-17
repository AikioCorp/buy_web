import React, { ReactNode, useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminDashboardSidebar from './AdminDashboardSidebar'
import AdminDashboardHeader from './AdminDashboardHeader'

type AdminDashboardLayoutProps = {
  children?: ReactNode
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  // Load sidebar state from localStorage or default based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-sidebar-open')
      if (saved !== null) {
        return saved === 'true'
      }
      return window.innerWidth >= 1024 // lg breakpoint
    }
    return false
  })
  
  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin-sidebar-open', String(sidebarOpen))
  }, [sidebarOpen])
  
  // Update sidebar state on window resize only if not manually set
  useEffect(() => {
    const handleResize = () => {
      // Only auto-adjust on mobile/desktop transition
      if (window.innerWidth < 1024 && sidebarOpen) {
        // Don't force close on mobile, let user control it
      } else if (window.innerWidth >= 1024) {
        // On desktop, respect saved preference
        const saved = localStorage.getItem('admin-sidebar-open')
        if (saved === null) {
          setSidebarOpen(true)
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen])
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={closeSidebar} />
      )}

      <AdminDashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 w-full min-w-0">
        <AdminDashboardHeader toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardLayout
