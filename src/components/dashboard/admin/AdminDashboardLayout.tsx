import React, { ReactNode, useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminDashboardSidebar from './AdminDashboardSidebar'
import AdminDashboardHeader from './AdminDashboardHeader'

type AdminDashboardLayoutProps = {
  children?: ReactNode
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      // On desktop, always default to open
      if (window.innerWidth >= 1024) {
        return true
      }
      return false
    }
    return true
  })
  
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
