import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  ShoppingBag, 
  Heart,
  User,
  CreditCard,
  MapPin,
  Settings, 
  MessageSquare,
  Bell 
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
        ? 'bg-green-700 text-white' 
        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'}
    `}
  >
    <div className="w-5 h-5">{icon}</div>
    <span className="font-medium">{label}</span>
  </NavLink>
)

type ClientDashboardSidebarProps = {
  isOpen: boolean
}

const ClientDashboardSidebar: React.FC<ClientDashboardSidebarProps> = ({ isOpen }) => {
  const { user, role } = useAuthStore()
  
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
          <SidebarLink to="/client" icon={<Home />} label="Tableau de bord" />
          <SidebarLink to="/client/orders" icon={<ShoppingBag />} label="Mes commandes" />
          <SidebarLink to="/client/favorites" icon={<Heart />} label="Favoris" />
          <SidebarLink to="/client/profile" icon={<User />} label="Profil" />
          <SidebarLink to="/client/addresses" icon={<MapPin />} label="Adresses" />
          <SidebarLink to="/client/payments" icon={<CreditCard />} label="Paiements" />
          <SidebarLink to="/client/messages" icon={<MessageSquare />} label="Messages" />
          <SidebarLink to="/client/notifications" icon={<Bell />} label="Notifications" />
          <SidebarLink to="/client/settings" icon={<Settings />} label="Paramètres" />
        </div>
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-medium truncate w-36">{user?.email?.split('@')[0]}</div>
              <div className="text-xs text-gray-500 capitalize">{role || 'client'}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default ClientDashboardSidebar
