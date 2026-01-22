import { Link } from 'react-router-dom'
import { Menu, Search, ShoppingCart } from 'lucide-react'

export function SimpleNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0f4c2b] shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Icône Menu (gauche) */}
          <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Menu size={24} />
          </button>

          {/* Logo (centre) */}
          <Link to="/" className="flex-shrink-0">
            <img src="/logo.svg" alt="Buy More" className="h-10 w-auto" />
          </Link>

          {/* Icônes Recherche et Panier (droite) */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Search size={22} />
            </button>
            <Link to="/cart" className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative">
              <ShoppingCart size={22} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
