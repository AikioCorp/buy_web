import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Flag, BarChart, AlertCircle,
  LogOut, ChevronRight, ShieldCheck, ExternalLink, Globe,
  Store, Package, ShoppingCart, MessageSquare, Star, User, FolderTree, Bell, LayoutGrid, Zap
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { usePermissions } from '../../../hooks/usePermissions'

type SidebarLinkProps = {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number | string
  end?: boolean
  onClick?: () => void
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, badge, end, onClick }) => (
  <NavLink 
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) => `
      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${isActive 
        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
    `}
  >
    <div className="w-5 h-5 flex-shrink-0">{icon}</div>
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
  </NavLink>
)

type AdminDashboardSidebarProps = {
  isOpen: boolean
  onClose?: () => void
}

const AdminDashboardSidebar: React.FC<AdminDashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()
  const { canViewUsers, canViewShops, canViewProducts, canViewOrders } = usePermissions()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split('@')[0] || 'Admin'

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : displayName.substring(0, 2).toUpperCase()
  
  return (
    <aside 
      className={`
        bg-white border-r border-gray-200 transition-all duration-300 z-30
        fixed h-full lg:relative flex flex-col
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
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              BuyMore
            </span>
            <span className="text-xs text-gray-500">Administration</span>
          </div>
        )}
      </Link>

      {/* Profil Admin */}
      {isOpen && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ShieldCheck size={12} className="text-red-500" />
                <span>Administrateur</span>
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
          <SidebarLink to="/admin" icon={<LayoutDashboard size={20} />} label="Tableau de bord" end onClick={onClose} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Gestion
          </p>
        )}
        <div className="space-y-1">
          {canViewUsers() && (
            <SidebarLink to="/admin/users" icon={<Users size={20} />} label="Utilisateurs" onClick={onClose} />
          )}
          {canViewShops() && (
            <SidebarLink to="/admin/shops" icon={<Store size={20} />} label="Boutiques" onClick={onClose} />
          )}
          {canViewProducts() && (
            <SidebarLink to="/admin/products" icon={<Package size={20} />} label="Produits" onClick={onClose} />
          )}
          {canViewProducts() && (
            <SidebarLink to="/admin/categories" icon={<FolderTree size={20} />} label="Catégories" onClick={onClose} />
          )}
          {canViewOrders() && (
            <SidebarLink to="/admin/orders" icon={<ShoppingCart size={20} />} label="Commandes" onClick={onClose} />
          )}
          <SidebarLink to="/admin/reports" icon={<Flag size={20} />} label="Rapports" onClick={onClose} />
          <SidebarLink to="/admin/moderation" icon={<AlertCircle size={20} />} label="Modération" onClick={onClose} />
          <SidebarLink to="/admin/homepage" icon={<LayoutGrid size={20} />} label="Page d'accueil" onClick={onClose} />
          <SidebarLink to="/admin/flash-sales" icon={<Zap size={20} />} label="Flash Sales" onClick={onClose} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Modération
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/admin/reviews" icon={<Star size={20} />} label="Avis" onClick={onClose} />
          <SidebarLink to="/admin/messages" icon={<MessageSquare size={20} />} label="Messages" onClick={onClose} />
          <SidebarLink to="/admin/notifications" icon={<Bell size={20} />} label="Notifications" onClick={onClose} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Mon compte
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/admin/analytics" icon={<BarChart size={20} />} label="Statistiques" onClick={onClose} />
          <SidebarLink to="/admin/profile" icon={<User size={20} />} label="Mon profil" onClick={onClose} />
        </div>
      </nav>

      {/* Déconnexion */}
      <div className="p-3 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}

export default AdminDashboardSidebar
