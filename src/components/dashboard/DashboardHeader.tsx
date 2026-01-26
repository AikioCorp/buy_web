import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Menu, Bell, Search, ChevronDown, Settings, User, 
  LogOut, HelpCircle, ExternalLink, Sun, Moon
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

interface DashboardHeaderProps {
  toggleSidebar: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate()
  const { logout, user, role } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const timeoutRef = useRef<number | null>(null)
  const notifTimeoutRef = useRef<number | null>(null)
  
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

  const handleNotifEnter = () => {
    if (notifTimeoutRef.current) window.clearTimeout(notifTimeoutRef.current)
    setIsNotifOpen(true)
  }

  const handleNotifLeave = () => {
    notifTimeoutRef.current = window.setTimeout(() => setIsNotifOpen(false), 200)
  }

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email?.split('@')[0] || 'Utilisateur'

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : displayName.substring(0, 2).toUpperCase()

  // Notifications fictives pour le moment
  const notifications = [
    { id: 1, title: 'Bienvenue sur BuyMore!', message: 'Commencez par créer votre boutique', time: 'À l\'instant', unread: true },
  ]

  return (
    <header className="bg-white border-b border-gray-200 h-[72px] flex items-center px-4 lg:px-6 sticky top-0 z-20">
      {/* Toggle Sidebar */}
      <button
        onClick={toggleSidebar}
        className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex ml-4 flex-1 relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher produits, commandes..."
          className="pl-11 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 text-sm transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

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
        <div 
          className="relative"
          onMouseEnter={handleNotifEnter}
          onMouseLeave={handleNotifLeave}
        >
          <button className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 relative transition-colors">
            <Bell size={20} />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-30">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <span className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">
                  Tout marquer comme lu
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        notif.unread ? 'border-emerald-500 bg-emerald-50/50' : 'border-transparent'
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <Link 
                  to="/dashboard/notifications"
                  className="text-sm text-emerald-600 font-medium hover:underline"
                >
                  Voir toutes les notifications
                </Link>
              </div>
            </div>
          )}
        </div>

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
