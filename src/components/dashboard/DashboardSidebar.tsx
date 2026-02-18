import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Store,
  Settings, 
  BarChart3, 
  Truck,
  Wallet,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { productsService } from '../../lib/api/productsService'
import { ordersService } from '../../lib/api/ordersService'
import { Shop } from '../../lib/api/shopsService'

type SidebarLinkProps = {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number | string
  end?: boolean
  disabled?: boolean
  onClick?: () => void
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, badge, end, disabled, onClick }) => {
  if (disabled) {
    return (
      <div className="group flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 cursor-not-allowed">
        <div className="w-5 h-5 flex-shrink-0">{icon}</div>
        <span className="font-medium flex-1 text-gray-400">{label}</span>
        {badge !== undefined && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-400">
            {badge}
          </span>
        )}
      </div>
    )
  }

  return (
    <NavLink 
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `
        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-500/25' 
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
}

type DashboardSidebarProps = {
  isOpen: boolean
  shop?: Shop | null
  onClose?: () => void
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, shop, onClose }) => {
  const { user, role, logout } = useAuthStore()
  const [stats, setStats] = useState({ products: 0, orders: 0 })

  // Only close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.()
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productsService.getMyProducts(),
        ordersService.getOrders()
      ])
      
      const products = productsRes.data ? (Array.isArray(productsRes.data) ? productsRes.data.length : 0) : 0
      const orders = ordersRes.data ? (Array.isArray(ordersRes.data) ? ordersRes.data.length : 0) : 0
      
      setStats({ products, orders })
    } catch (error) {
      console.error('Erreur chargement stats sidebar:', error)
    }
  }
  
  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  // Obtenir le nom d'affichage
  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split('@')[0] || 'Utilisateur'

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
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              BuyMore
            </span>
            <span className="text-xs text-gray-500">Espace Vendeur</span>
          </div>
        )}
      </Link>

      {/* Profil vendeur rapide */}
      {isOpen && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              {shop?.is_verified && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span>Vendeur vérifié</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Mini stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-emerald-700">{stats.products}</p>
              <p className="text-xs text-emerald-600">Produits</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-700">{stats.orders}</p>
              <p className="text-xs text-blue-600">Commandes</p>
            </div>
          </div>
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
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Tableau de bord" end onClick={handleLinkClick} />
          <SidebarLink to="/dashboard/store" icon={<Store size={20} />} label="Ma Boutique" onClick={handleLinkClick} />
          <SidebarLink to="/dashboard/products" icon={<Package size={20} />} label="Produits" badge={stats.products} disabled={!shop?.is_active} onClick={handleLinkClick} />
          <SidebarLink to="/dashboard/orders" icon={<ShoppingCart size={20} />} label="Commandes" badge={stats.orders} disabled={!shop?.is_active} onClick={handleLinkClick} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Analytics & Finance
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/dashboard/analytics" icon={<BarChart3 size={20} />} label="Statistiques" disabled={!shop?.is_active} onClick={handleLinkClick} />
          <SidebarLink to="/dashboard/earnings" icon={<Wallet size={20} />} label="Revenus" disabled={!shop?.is_active} onClick={handleLinkClick} />
          <SidebarLink to="/dashboard/shipping" icon={<Truck size={20} />} label="Livraisons" disabled={!shop?.is_active} onClick={handleLinkClick} />
        </div>

        {isOpen && (
          <p className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Paramètres
          </p>
        )}
        <div className="space-y-1">
          <SidebarLink to="/dashboard/settings" icon={<Settings size={20} />} label="Paramètres" onClick={handleLinkClick} />
          <SidebarLink to="/dashboard/help" icon={<HelpCircle size={20} />} label="Aide & Support" onClick={handleLinkClick} />
        </div>
      </nav>

      {/* Upgrade Link - Discret */}
      {isOpen && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-amber-600 transition-colors">
            <TrendingUp size={14} />
            <span>Passer Pro</span>
          </button>
        </div>
      )}

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

export default DashboardSidebar
