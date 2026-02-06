import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Menu, Search, ChevronDown, ShoppingCart, 
  User, LogOut, Settings, HelpCircle, ExternalLink, Package, Home, Grid, Store as StoreIcon, Heart
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { useCartStore } from '../../../store/cartStore'
import NotificationBell from '../../NotificationBell'

interface ClientDashboardHeaderProps {
  toggleSidebar: () => void
}

const ClientDashboardHeader: React.FC<ClientDashboardHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const cartItems = useCartStore((state) => state.items)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const timeoutRef = useRef<number | null>(null)
  
  const handleMouseEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setIsDropdownOpen(false), 200)
  }
  
  const handleSignOut = async () => {
    await logout()
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split('@')[0] || 'Client'

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : displayName.substring(0, 2).toUpperCase()

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white border-b border-gray-200 h-[72px] flex items-center px-4 lg:px-6 sticky top-0 z-20">
      {/* Toggle Sidebar */}
      <button
        onClick={toggleSidebar}
        className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Navigation Menu */}
      <nav className="hidden lg:flex items-center gap-1 ml-6">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <Home size={16} />
          <span>Accueil</span>
        </Link>
        <Link to="/categories" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <Grid size={16} />
          <span>Catégories</span>
        </Link>
        <Link to="/shops" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <StoreIcon size={16} />
          <span>Boutiques</span>
        </Link>
        <Link to="/favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <Heart size={16} />
          <span>Favoris</span>
        </Link>
      </nav>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="hidden md:flex ml-4 flex-1 relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher des produits, boutiques..."
          className="pl-11 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-sm transition-all"
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </form>

      {/* Right Actions */}
      <div className="flex items-center ml-auto gap-2">
        {/* Lien vers le site */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
        >
          <ExternalLink size={16} />
          <span>Boutique</span>
        </Link>

        {/* Panier */}
        <button 
          onClick={() => navigate('/cart')}
          className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 relative transition-colors"
        >
          <ShoppingCart size={20} />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {cartItemsCount > 9 ? '9+' : cartItemsCount}
            </span>
          )}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div 
          className="relative ml-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userInitials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Client</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden md:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-30">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{displayName}</p>
                {user?.email && !user.email.includes('@phone.buymore.ml') && (
                  <p className="text-sm text-gray-500">{user.email}</p>
                )}
                {user?.phone && (
                  <p className="text-sm text-gray-500">{user.phone}</p>
                )}
              </div>
              
              <div className="py-1">
                <Link
                  to="/client/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Mon profil
                </Link>
                <Link
                  to="/client/orders"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Package size={16} />
                  Mes commandes
                </Link>
                <Link
                  to="/client/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Paramètres
                </Link>
                <Link
                  to="/help"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <HelpCircle size={16} />
                  Aide & Support
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default ClientDashboardHeader
