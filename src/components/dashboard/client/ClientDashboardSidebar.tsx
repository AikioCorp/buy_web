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

const SidebarLink: React.FC<SidebarLinkProps & { isCollapsed?: boolean }> = ({ to, icon, label, onClick, isCollapsed }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 rounded-lg transition-all relative
      ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'}
      ${isActive
        ? 'bg-green-700 text-white'
        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'}
    `}
    title={isCollapsed ? label : undefined}
  >
    <div className="w-5 h-5 flex-shrink-0">{icon}</div>
    {!isCollapsed && <span className="font-medium">{label}</span>}
  </NavLink>
)

type ClientDashboardSidebarProps = {
  isOpen: boolean
  onClose?: () => void
}

const ClientDashboardSidebar: React.FC<ClientDashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuthStore()

  // Only close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.()
    }
  }

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
        <div className={`overflow-hidden flex items-center justify-center ${isOpen ? 'w-auto' : 'w-0 lg:w-10'}`}>
          <img
            src="/logo.svg"
            alt="BuyMore Logo"
            className={`h-12 w-auto transition-all ${!isOpen && 'lg:hidden'}`}
          />
          <img
            src="/logo.svg"
            alt="BuyMore Logo"
            className={`hidden lg:block h-8 w-auto object-contain ${isOpen && 'lg:hidden'}`}
          />
        </div>
      </div>

      <nav className="mt-4 px-2 flex-1 overflow-y-auto">
        <div className="space-y-1">
          <SidebarLink to="/client" icon={<Home />} label="Tableau de bord" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/orders" icon={<ShoppingBag />} label="Mes commandes" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/favorites" icon={<Heart />} label="Favoris" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/profile" icon={<User />} label="Profil" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/addresses" icon={<MapPin />} label="Adresses" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/payments" icon={<CreditCard />} label="Paiements" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/messages" icon={<MessageSquare />} label="Messages" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/notifications" icon={<Bell />} label="Notifications" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/client/settings" icon={<Settings />} label="Paramètres" onClick={handleLinkClick} isCollapsed={!isOpen} />
        </div>
      </nav>

      {isOpen && (
        <div className="p-4 border-t border-gray-100">
          <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold overflow-hidden shrink-0">
              {user?.avatar_url || user?.avatar ? (
                <img
                  src={user?.avatar_url || user?.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.email?.charAt(0).toUpperCase() || 'U')
              )}
            </div>
            <div>
              <div className="font-medium truncate w-32 text-sm">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email?.split('@')[0]}</div>
              <div className="text-xs text-gray-500 capitalize">{role === 'client' ? 'Client' : role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default ClientDashboardSidebar
