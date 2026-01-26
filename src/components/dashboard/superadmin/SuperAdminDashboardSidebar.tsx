import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Users, TrendingUp, Settings, 
  Shield, Gauge, Briefcase, FolderTree, Package, ShoppingBag, UtensilsCrossed
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

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
        ? 'bg-indigo-600 text-white' 
        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}
    `}
  >
    <div className="w-5 h-5">{icon}</div>
    <span className="font-medium">{label}</span>
  </NavLink>
)

type SuperAdminDashboardSidebarProps = {
  isOpen: boolean
}

const SuperAdminDashboardSidebar: React.FC<SuperAdminDashboardSidebarProps> = ({ isOpen }) => {
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
          <h1 className={`text-xl font-bold text-indigo-700 ${!isOpen && 'md:hidden'}`}>BuyMore</h1>
          <span className={`hidden md:block text-2xl font-bold text-indigo-700 ${isOpen && 'md:hidden'}`}>
            👑
          </span>
        </div>
      </div>
      
      <nav className="mt-4 px-2">
        <div className="space-y-1">
          <SidebarLink to="/superadmin" icon={<Home />} label="Dashboard" />
          
          <div className="px-4 py-2 mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Gestion</p>
          </div>
          
          <SidebarLink to="/superadmin/users" icon={<Users />} label="Utilisateurs" />
          <SidebarLink to="/superadmin/businesses" icon={<Briefcase />} label="Boutiques" />
          <SidebarLink to="/superadmin/restaurants" icon={<UtensilsCrossed />} label="Restaurants" />
          <SidebarLink to="/superadmin/categories" icon={<FolderTree />} label="Catégories" />
          <SidebarLink to="/superadmin/products" icon={<Package />} label="Produits" />
          <SidebarLink to="/superadmin/orders" icon={<ShoppingBag />} label="Commandes" />
          
          <div className="px-4 py-2 mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Système</p>
          </div>
          
          <SidebarLink to="/superadmin/analytics" icon={<TrendingUp />} label="Analytiques" />
          <SidebarLink to="/superadmin/performance" icon={<Gauge />} label="Performance" />
          <SidebarLink to="/superadmin/security" icon={<Shield />} label="Permissions" />
          <SidebarLink to="/superadmin/settings" icon={<Settings />} label="Paramètres" />
        </div>
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <div className="font-medium truncate w-36 text-gray-900">{user?.email?.split('@')[0] || 'Super Admin'}</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default SuperAdminDashboardSidebar
