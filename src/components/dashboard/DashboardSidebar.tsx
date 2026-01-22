import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  BarChart, 
  Truck,
  MessageSquare,
  Bell,
  CreditCard
} from 'lucide-react'
import { useAuthStore } from '@buymore/api-client'

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
        ? 'bg-green-700 text-white' 
        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'}
    `}
  >
    <div className="w-5 h-5">{icon}</div>
    <span className="font-medium">{label}</span>
  </NavLink>
)

type DashboardSidebarProps = {
  isOpen: boolean
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen }) => {
  const { profile } = useAuthStore()
  const isVendor = profile?.role === 'vendor'
  
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
          <h1 className={`text-xl font-bold text-green-800 ${!isOpen && 'md:hidden'}`}>BuyMore</h1>
          <span className={`hidden md:block text-2xl font-bold text-green-800 ${isOpen && 'md:hidden'}`}>
            B
          </span>
        </div>
      </div>
      
      <nav className="mt-4 px-2">
        <div className="space-y-1">
          <SidebarLink to="/dashboard" icon={<Home />} label="Dashboard" />
          
          {isVendor && (
            <>
              <SidebarLink to="/dashboard/products" icon={<Package />} label="Produits" />
              <SidebarLink to="/dashboard/orders" icon={<ShoppingBag />} label="Commandes" />
              <SidebarLink to="/dashboard/customers" icon={<Users />} label="Clients" />
              <SidebarLink to="/dashboard/analytics" icon={<BarChart />} label="Statistiques" />
              <SidebarLink to="/dashboard/shipping" icon={<Truck />} label="Livraisons" />
              <SidebarLink to="/dashboard/messages" icon={<MessageSquare />} label="Messages" />
              <SidebarLink to="/dashboard/notifications" icon={<Bell />} label="Notifications" />
              <SidebarLink to="/dashboard/payments" icon={<CreditCard />} label="Paiements" />
            </>
          )}
          
          <SidebarLink to="/dashboard/settings" icon={<Settings />} label="Paramètres" />
        </div>
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-medium truncate w-36">{profile?.full_name}</div>
              <div className="text-xs text-gray-500 capitalize">{profile?.role || 'utilisateur'}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default DashboardSidebar
