import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '@buymore/api-client'

interface ClientDashboardHeaderProps {
  toggleSidebar: () => void
}

const ClientDashboardHeader: React.FC<ClientDashboardHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate()
  const { signOut, profile } = useAuthStore()
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
      >
        <Menu size={20} />
      </button>

      <div className="hidden md:flex ml-4 flex-1 relative max-w-xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher des produits, boutiques..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-50"
        />
      </div>

      <div className="flex items-center ml-auto gap-3">
        <button 
          onClick={() => navigate('/cart')}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
        >
          <ShoppingCart size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative ml-2 group">
          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block">{profile?.full_name}</span>
            <ChevronDown size={16} />
          </button>

          <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20">
            <a
              href="/client/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mon profil
            </a>
            <a
              href="/client/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Paramètres
            </a>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ClientDashboardHeader
