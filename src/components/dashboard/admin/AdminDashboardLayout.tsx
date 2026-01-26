import React, { ReactNode, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminDashboardSidebar from './AdminDashboardSidebar'
import AdminDashboardHeader from './AdminDashboardHeader'

type AdminDashboardLayoutProps = {
  children?: ReactNode
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminDashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full">
        <AdminDashboardHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardLayout
