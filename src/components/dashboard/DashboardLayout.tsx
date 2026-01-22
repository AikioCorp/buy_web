import React, { ReactNode, useState } from 'react'
import { Outlet } from 'react-router-dom'
// Import des composants dashboard
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'

type DashboardLayoutProps = {
  children?: ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} />
      
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
