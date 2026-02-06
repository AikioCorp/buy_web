import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown, LogOut, AlertCircle, Home, Grid, Store as StoreIcon, Heart } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import NotificationBell from '../../NotificationBell'
import { shopsService } from '../../../lib/api/shopsService'

interface SuperAdminDashboardHeaderProps {
  toggleSidebar: () => void
}

const SuperAdminDashboardHeader: React.FC<SuperAdminDashboardHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [pendingShopsCount, setPendingShopsCount] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    loadPendingShopsCount()
    const interval = setInterval(loadPendingShopsCount, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadPendingShopsCount = async () => {
    try {
      const response = await shopsService.getAllShopsAdmin({ page: 1 })
      if (response.data) {
        const shops = 'results' in response.data ? response.data.results : response.data as any[]
        const pending = shops.filter(s => !s.is_active || s.status === 'pending').length
        setPendingShopsCount(pending)
      }
    } catch (error) {
      console.error('Error loading pending shops count:', error)
    }
  }
  
  const handleSignOut = async () => {
    await logout()
    navigate('/login')
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false)
    }, 200)
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
      >
        <Menu size={20} />
      </button>

      {/* Navigation Menu */}
      <nav className="hidden lg:flex items-center gap-1 ml-6">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Home size={16} />
          <span>Accueil</span>
        </Link>
        <Link to="/categories" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Grid size={16} />
          <span>Catégories</span>
        </Link>
        <Link to="/shops" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <StoreIcon size={16} />
          <span>Boutiques</span>
        </Link>
        <Link to="/favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Heart size={16} />
          <span>Favoris</span>
        </Link>
      </nav>

      <div className="hidden md:flex ml-4 flex-1 relative max-w-xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
        />
      </div>

      <div className="flex items-center ml-auto gap-3">
        <button 
          onClick={() => navigate('/superadmin/shop-requests')}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
          title="Boutiques en attente d'approbation"
        >
          <AlertCircle size={20} />
          {pendingShopsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-yellow-500 text-white text-[10px] font-bold rounded-full px-1">
              {pendingShopsCount > 99 ? '99+' : pendingShopsCount}
            </span>
          )}
        </button>

        <NotificationBell variant="light" />

        <div 
          className="relative ml-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            <span className="hidden md:block">Super Admin</span>
            <ChevronDown size={16} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20">
              <a
                href="/superadmin/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Votre profil
              </a>
              <a
                href="/superadmin/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Paramètres système
              </a>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default SuperAdminDashboardHeader
