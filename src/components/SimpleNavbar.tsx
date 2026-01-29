import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export function SimpleNavbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { getItemCount } = useCartStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f4c2b] shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/logo.svg" alt="Buy More" className="h-10 w-auto" />
          </Link>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits, boutiques..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border-2 border-white/20 bg-white text-gray-800 text-sm focus:outline-none focus:border-[#e8d20c] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#e8d20c] hover:bg-[#d4c00b] text-[#0f4c2b] px-4 py-1.5 rounded-full font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Liens de navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/shops" className="text-white hover:text-[#e8d20c] transition-colors font-medium">
              Boutiques
            </Link>
            <Link to="/categories" className="text-white hover:text-[#e8d20c] transition-colors font-medium">
              Catégories
            </Link>
            <Link to="/products" className="text-white hover:text-[#e8d20c] transition-colors font-medium">
              Produits
            </Link>
            <Link to="/deals" className="text-white hover:text-[#e8d20c] transition-colors font-medium">
              Promotions
            </Link>
            <Link to="/about" className="text-white hover:text-[#e8d20c] transition-colors font-medium">
              À propos
            </Link>
          </div>

          {/* Icônes */}
          <div className="flex items-center gap-3">
            <Link to="/favorites" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </Link>
            
            <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-white" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e8d20c] text-[#0f4c2b] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            <Link to="/login">
              <button className="px-4 py-2 rounded-full bg-white text-[#0f4c2b] text-sm font-semibold hover:bg-gray-100 transition-colors">
                Connexion
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
