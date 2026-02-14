import React, { ReactNode, useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
// Import des composants dashboard
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'
import { useAuthStore } from '../../stores/authStore'
import { shopsService, Shop } from '../../lib/api/shopsService'

type DashboardLayoutProps = {
  children?: ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shop, setShop] = useState<Shop | null>(null)
  const { user } = useAuthStore()
  
  useEffect(() => {
    if (user?.id) {
      loadShop()
    }
  }, [user?.id])

  const loadShop = async () => {
    try {
      const response = await shopsService.getMyShop(user?.id?.toString())
      if (response.data) {
        setShop(response.data)
      }
    } catch (error) {
      console.error('Error loading shop:', error)
    }
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={closeSidebar} 
        />
      )}

      <DashboardSidebar isOpen={sidebarOpen} shop={shop} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 w-full min-w-0">
        <DashboardHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
