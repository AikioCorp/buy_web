import React, { ReactNode, useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SuperAdminDashboardSidebar from './SuperAdminDashboardSidebar'
import SuperAdminDashboardHeader from './SuperAdminDashboardHeader'

type SuperAdminDashboardLayoutProps = {
  children?: ReactNode
}

const SuperAdminDashboardLayout: React.FC<SuperAdminDashboardLayoutProps> = ({ children }) => {
  // Load sidebar state from localStorage or default based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      // On desktop, always default to open
      if (window.innerWidth >= 1024) {
        return true
      }
      // On mobile, check saved preference
      const saved = localStorage.getItem('superadmin-sidebar-open')
      if (saved !== null) {
        return saved === 'true'
      }
      return false
    }
    return true
  })
  
  // Save sidebar state to localStorage only on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      localStorage.setItem('superadmin-sidebar-open', String(sidebarOpen))
    }
  }, [sidebarOpen])
  
  // Auto-open sidebar on desktop when resizing from mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
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

      <SuperAdminDashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <SuperAdminDashboardHeader toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default SuperAdminDashboardLayout
