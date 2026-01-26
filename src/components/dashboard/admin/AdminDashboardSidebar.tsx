import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Users, Flag, BarChart, Settings, Lock, Database, AlertCircle,
  Shield, Activity
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

type SidebarLinkProps = {
  to: string
  icon: React.ReactNode
  label: string
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
      ${isActive 
        ? 'bg-red-700 text-white' 
        : 'text-gray-600 hover:bg-red-50 hover:text-red-700'}
    `}
  >
    <div className="w-5 h-5">{icon}</div>
    <span className="font-medium">{label}</span>
  </NavLink>
)

type AdminDashboardSidebarProps = {
  isOpen: boolean
}

const AdminDashboardSidebar: React.FC<AdminDashboardSidebarProps> = ({ isOpen }) => {
  const { user } = useAuthStore()
  
  return (
    <aside 
      className={`
        bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-20
        ${isOpen ? 'w-64' : 'w-0 md:w-20'} 
        fixed h-full md:relative overflow-hidden
      `}
    >
      <div className="p-4 flex justify-center items-center border-b border-gray-200 h-16">
        <div className={`overflow-hidden ${isOpen ? 'w-auto' : 'w-0 md:w-10'}`}>
          <h1 className={`text-xl font-bold text-red-800 ${!isOpen && 'md:hidden'}`}>BuyMore</h1>
          <span className={`hidden md:block text-2xl font-bold text-red-800 ${isOpen && 'md:hidden'}`}>
            🛡️
          </span>
        </div>
      </div>
      
      <nav className="mt-4 px-2">
        <div className="space-y-1">
          <SidebarLink to="/admin" icon={<Home />} label="Dashboard" />
          <SidebarLink to="/admin/users" icon={<Users />} label="Utilisateurs" />
          <SidebarLink to="/admin/reports" icon={<Flag />} label="Rapports" />
          <SidebarLink to="/admin/moderation" icon={<AlertCircle />} label="Modération" />
          <SidebarLink to="/admin/analytics" icon={<BarChart />} label="Statistiques" />
          <SidebarLink to="/admin/security" icon={<Shield />} label="Sécurité" />
          <SidebarLink to="/admin/settings" icon={<Settings />} label="Paramètres" />
        </div>
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-red-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-800 font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div className="font-medium truncate w-36 text-gray-900">Admin</div>
              <div className="text-xs text-gray-500">Administrateur</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default AdminDashboardSidebar
