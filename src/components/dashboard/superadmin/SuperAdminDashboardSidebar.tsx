import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { 
  LayoutDashboard, Users, TrendingUp, 
  Shield, Briefcase, FolderTree, Package, ShoppingBag, UtensilsCrossed,
  LogOut, ChevronRight, Crown, ExternalLink, Globe, AlertCircle,
  MessageSquare, Star, User, Store, Bell, FileText, LayoutGrid, Zap
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

type SidebarLinkProps = {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number | string
  end?: boolean
  onClick?: () => void
}

const SidebarLink: React.FC<SidebarLinkProps & { isCollapsed?: boolean }> = ({ to, icon, label, badge, end, onClick, isCollapsed }) => (
  <NavLink 
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) => `
      group flex items-center gap-3 rounded-xl transition-all duration-200 relative
      ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'}
      ${isActive 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
    `}
    title={isCollapsed ? label : undefined}
  >
    <div className="w-5 h-5 flex-shrink-0">{icon}</div>
    {!isCollapsed && (
      <>
        <span className="font-medium flex-1">{label}</span>
        {badge !== undefined && (
          <span className={`
            px-2 py-0.5 text-xs font-semibold rounded-full
            ${typeof badge === 'number' && badge > 0 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-600'}
          `}>
            {badge}
          </span>
        )}
        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </>
    )}
    {isCollapsed && badge !== undefined && typeof badge === 'number' && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
)

type SuperAdminDashboardSidebarProps = {
  isOpen: boolean
  onClose?: () => void
}

const SuperAdminDashboardSidebar: React.FC<SuperAdminDashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()

  // Only close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.()
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split('@')[0] || 'Super Admin'

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : displayName.substring(0, 2).toUpperCase()
  
  return (
    <aside 
      className={`
        bg-white border-r border-gray-200 transition-all duration-300 z-30
        fixed h-full lg:relative flex flex-col flex-shrink-0
        ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20'}
        overflow-hidden
      `}
    >
      {/* Logo - Cliquable vers la page d'accueil */}
      <Link 
        to="/"
        className="p-4 flex items-center gap-3 border-b border-gray-100 h-[72px] hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 flex-shrink-0">
          <img 
            src="/assets/images/logos/logo_buy_more.png" 
            alt="BuyMore" 
            className="w-full h-full object-contain"
          />
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BuyMore
            </span>
            <span className="text-xs text-gray-500">Super Administration</span>
          </div>
        )}
      </Link>

      {/* Profil Super Admin */}
      {isOpen && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Crown size={12} className="text-amber-500 fill-amber-500" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>
          
          {/* Lien vers le site */}
          <Link
            to="/"
            target="_blank"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Globe size={16} />
            <span>Visiter le site</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      )}
      
      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto p-3">
        {isOpen && (
          <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu Principal
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/superadmin" icon={<LayoutDashboard size={20} />} label="Tableau de bord" end onClick={handleLinkClick} isCollapsed={!isOpen} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Gestion
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/superadmin/users" icon={<Users size={20} />} label="Utilisateurs" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/businesses" icon={<Briefcase size={20} />} label="Boutiques" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/restaurants" icon={<UtensilsCrossed size={20} />} label="Restaurants" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/categories" icon={<FolderTree size={20} />} label="Catégories" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/products" icon={<Package size={20} />} label="Produits" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/orders" icon={<ShoppingBag size={20} />} label="Commandes" onClick={handleLinkClick} isCollapsed={!isOpen} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Modération
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/superadmin/shop-requests" icon={<Store size={20} />} label="Demandes boutiques" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/moderation" icon={<AlertCircle size={20} />} label="Modération" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/homepage" icon={<LayoutGrid size={20} />} label="Page d'accueil" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/flash-sales" icon={<Zap size={20} />} label="Flash Sales" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/reviews" icon={<Star size={20} />} label="Avis" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/messages" icon={<MessageSquare size={20} />} label="Messages" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/notifications" icon={<Bell size={20} />} label="Notifications" onClick={handleLinkClick} isCollapsed={!isOpen} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Système
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/superadmin/analytics" icon={<TrendingUp size={20} />} label="Statistiques" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/reports" icon={<FileText size={20} />} label="Rapports" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/permissions" icon={<Shield size={20} />} label="Permissions" onClick={handleLinkClick} isCollapsed={!isOpen} />
          <SidebarLink to="/superadmin/profile" icon={<User size={20} />} label="Mon profil" onClick={handleLinkClick} isCollapsed={!isOpen} />
        </div>
      </nav>

      {/* Déconnexion */}
      <div className="p-3 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all ${
            isOpen ? 'px-4' : 'px-2 justify-center'
          }`}
          title={!isOpen ? 'Déconnexion' : undefined}
        >
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}

export default SuperAdminDashboardSidebar
