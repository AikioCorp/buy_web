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
  onClick?: () => void
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
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
  onClose?: () => void
}

const ClientDashboardSidebar: React.FC<ClientDashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuthStore()
  
  return (
    <aside 
      className={`
        bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-30
        fixed h-full lg:relative flex flex-col
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
        overflow-hidden
      `}
    >
      <div className="p-4 flex justify-center items-center border-b border-gray-200 h-16">
        <div className={`overflow-hidden ${isOpen ? 'w-auto' : 'w-0 lg:w-10'}`}>
          <h1 className={`text-xl font-bold text-green-800 ${!isOpen && 'lg:hidden'}`}>BuyMore</h1>
          <span className={`hidden lg:block text-2xl font-bold text-green-800 ${isOpen && 'lg:hidden'}`}>
            B
          </span>
        </div>
      </div>
      
      <nav className="mt-4 px-2 flex-1 overflow-y-auto">
        <div className="space-y-1">
          <SidebarLink to="/client" icon={<Home />} label="Tableau de bord" onClick={onClose} />
          <SidebarLink to="/client/orders" icon={<ShoppingBag />} label="Mes commandes" onClick={onClose} />
          <SidebarLink to="/client/favorites" icon={<Heart />} label="Favoris" onClick={onClose} />
          <SidebarLink to="/client/profile" icon={<User />} label="Profil" onClick={onClose} />
          <SidebarLink to="/client/addresses" icon={<MapPin />} label="Adresses" onClick={onClose} />
          <SidebarLink to="/client/payments" icon={<CreditCard />} label="Paiements" onClick={onClose} />
          <SidebarLink to="/client/messages" icon={<MessageSquare />} label="Messages" onClick={onClose} />
          <SidebarLink to="/client/notifications" icon={<Bell />} label="Notifications" onClick={onClose} />
          <SidebarLink to="/client/settings" icon={<Settings />} label="Paramètres" onClick={onClose} />
        </div>
      </nav>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-100">
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
