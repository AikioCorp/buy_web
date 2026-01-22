import React, { ReactNode, useState } from 'react'
import { Outlet } from 'react-router-dom'
import ClientDashboardSidebar from './ClientDashboardSidebar'
import ClientDashboardHeader from './ClientDashboardHeader'

type ClientDashboardLayoutProps = {
  children?: ReactNode
}

const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ClientDashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full">
        <ClientDashboardHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default ClientDashboardLayout
