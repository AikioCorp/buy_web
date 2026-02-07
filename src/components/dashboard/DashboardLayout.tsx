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
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} shop={shop} />
      
      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
