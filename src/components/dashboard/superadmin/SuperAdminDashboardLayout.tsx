import React, { ReactNode, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SuperAdminDashboardSidebar from './SuperAdminDashboardSidebar'
import SuperAdminDashboardHeader from './SuperAdminDashboardHeader'

type SuperAdminDashboardLayoutProps = {
  children?: ReactNode
}

const SuperAdminDashboardLayout: React.FC<SuperAdminDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminDashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <SuperAdminDashboardHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default SuperAdminDashboardLayout
