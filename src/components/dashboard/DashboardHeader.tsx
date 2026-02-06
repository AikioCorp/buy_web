import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Menu, Search, ChevronDown, Settings, User, 
  LogOut, HelpCircle, ExternalLink, Home, Grid, Store as StoreIcon, Heart
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import NotificationBell from '../NotificationBell'

interface DashboardHeaderProps {
  toggleSidebar: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate()
  const { logout, user, role } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const timeoutRef = useRef<number | null>(null)
  
  const handleSignOut = async () => {
    await logout()
    navigate('/')
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setIsDropdownOpen(false), 200)
  }

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split('@')[0] || 'Utilisateur'

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : displayName.substring(0, 2).toUpperCase()

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
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Home size={16} />
          <span>Accueil</span>
        </Link>
        <Link
          to="/categories"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Grid size={16} />
          <span>Catégories</span>
        </Link>
        <Link
          to="/shops"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <StoreIcon size={16} />
          <span>Boutiques</span>
        </Link>
        <Link
          to="/favorites"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Heart size={16} />
          <span>Favoris</span>
        </Link>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center ml-auto gap-2">
        {/* Lien vers le site */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
        >
          <ExternalLink size={16} />
          <span>Voir le site</span>
        </Link>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div 
          className="relative ml-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userInitials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{role || 'Vendeur'}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden md:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-30">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Mon profil
                </Link>
                <Link
                  to="/dashboard/store"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Ma boutique
                </Link>
                <Link
                  to="/dashboard/help"
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

export default DashboardHeader
