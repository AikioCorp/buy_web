import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Menu, X, LogOut, ChevronRight, Store, Tag, Package } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import NotificationBell from './NotificationBell'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { shopsService } from '../lib/api/shopsService'
import { categoriesService } from '../lib/api/categoriesService'
import { productsService } from '../lib/api/productsService'

interface ShopItem {
  id: number
  name: string
  slug: string
  logo_url?: string | null
}

interface CategoryItem {
  id: number
  name: string
  slug: string
  children?: CategoryItem[]
}

interface SearchSuggestion {
  type: 'product' | 'shop' | 'category'
  id: number
  name: string
  slug?: string
  image?: string | null
  price?: string
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showShopsMegaMenu, setShowShopsMegaMenu] = useState(false)
  const [showCategoriesMegaMenu, setShowCategoriesMegaMenu] = useState(false)
  const [shops, setShops] = useState<ShopItem[]>([])
  const [megaMenuTimeout, setMegaMenuTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [categoriesMegaMenuTimeout, setCategoriesMegaMenuTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleShopsMegaMenuEnter = () => {
    if (megaMenuTimeout) clearTimeout(megaMenuTimeout)
    setShowShopsMegaMenu(true)
  }

  const handleShopsMegaMenuLeave = () => {
    const timeout = setTimeout(() => setShowShopsMegaMenu(false), 150)
    setMegaMenuTimeout(timeout)
  }

  const handleCategoriesMegaMenuEnter = () => {
    if (categoriesMegaMenuTimeout) clearTimeout(categoriesMegaMenuTimeout)
    setShowCategoriesMegaMenu(true)
  }

  const handleCategoriesMegaMenuLeave = () => {
    const timeout = setTimeout(() => setShowCategoriesMegaMenu(false), 150)
    setCategoriesMegaMenuTimeout(timeout)
  }
  const [dynamicCategories, setDynamicCategories] = useState<CategoryItem[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const { user, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
  const { getFavoritesCount } = useFavoritesStore()

  const promos = [
    {
      id: 1,
      emoji: "🚚",
      title: "LIVRAISON GRATUITE",
      subtitle: "Sur toutes les commandes de plus de 50 000 FCFA",
      bgColor: "from-red-600 via-red-500 to-red-600",
      buttonText: "Profiter maintenant",
      link: "/deals"
    },
    {
      id: 2,
      emoji: "⚡",
      title: "FLASH SALE -70%",
      subtitle: "Réduction massive sur l'électronique - Offre limitée !",
      bgColor: "from-orange-600 via-orange-500 to-orange-600",
      buttonText: "J'en profite",
      link: "/deals"
    },
    {
      id: 3,
      emoji: "🎁",
      title: "BIENVENUE -15%",
      subtitle: "Nouveaux clients : Code promo BIENVENUE à la caisse",
      bgColor: "from-purple-600 via-purple-500 to-purple-600",
      buttonText: "S'inscrire",
      link: "/register"
    },
    {
      id: 4,
      emoji: "🔥",
      title: "OFFRE DU JOUR",
      subtitle: "Smartphones dernière génération à prix cassés !",
      bgColor: "from-blue-600 via-blue-500 to-blue-600",
      buttonText: "Découvrir",
      link: "/deals"
    }
  ]

  const popularSearches = [
    'iPhone 15',
    'Samsung Galaxy',
    'Ordinateur portable',
    'Écouteurs sans fil',
    'Shopreate',
  ]

  const categories = [
    'Appareils électroniques',
    'Mode & Vêtements',
    'Maison & Jardin',
    'Sports & Loisirs',
    'Beauté & Santé',
    'Alimentation',
    'Livres & Médias',
    'Jouets & Enfants',
  ]

  // Auto-rotation des promos toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promos.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [promos.length])

  // Détecter le scroll pour afficher le header sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY

      // Pour le header sticky (affiché quand on scrolle un peu)
      setIsScrolled(scrollPosition > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Charger les catégories depuis l'API (endpoint public uniquement)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les catégories (endpoint public - ne nécessite pas d'auth)
        const categoriesResponse = await categoriesService.getCategories()
        if (categoriesResponse.data) {
          setDynamicCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [])
        }
      } catch (error) {
        // Ignorer silencieusement les erreurs
      }
    }
    loadData()
  }, [])

  // Charger les boutiques depuis l'API uniquement
  useEffect(() => {
    const loadShops = async () => {
      try {
        const shopsResponse = await shopsService.getPublicShops(1, 8)
        console.log('Navbar loadShops response:', shopsResponse)

        if (shopsResponse.data?.results) {
          console.log('Navbar: Using API shops, count:', shopsResponse.data.results.length)
          setShops(shopsResponse.data.results.slice(0, 8))
        } else {
          setShops([])
        }
      } catch (error) {
        console.error('Navbar loadShops error:', error)
        setShops([])
      }
    }
    loadShops()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchSuggestions(false)
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Recherche intelligente avec debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([])
      setShowSearchSuggestions(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      const suggestions: SearchSuggestion[] = []
      const query = searchQuery.toLowerCase()

      try {
        // Recherche dans les produits
        const productsResponse = await productsService.getProducts({ search: searchQuery, page_size: 5 })
        if (productsResponse.data?.results) {
          productsResponse.data.results.forEach((product: any) => {
            suggestions.push({
              type: 'product',
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.media?.[0]?.image_url,
              price: product.base_price
            })
          })
        }
      } catch (e) {
        console.error('Search error:', e)
      }

      // Recherche dans les boutiques chargées
      shops.filter(shop => shop.name.toLowerCase().includes(query)).slice(0, 3).forEach(shop => {
        suggestions.push({
          type: 'shop',
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          image: shop.logo_url
        })
      })

      // Recherche dans les catégories chargées
      dynamicCategories.filter(cat => cat.name.toLowerCase().includes(query)).slice(0, 3).forEach(cat => {
        suggestions.push({
          type: 'category',
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        })
      })

      setSearchSuggestions(suggestions)
      setShowSearchSuggestions(suggestions.length > 0)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, shops, dynamicCategories])

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery('')
    setShowSearchSuggestions(false)
    switch (suggestion.type) {
      case 'product':
        navigate(`/products/${suggestion.id}`)
        break
      case 'shop':
        navigate(`/shops/${suggestion.slug || suggestion.id}`)
        break
      case 'category':
        navigate(`/products?category=${suggestion.slug}`)
        break
    }
  }

  const formatPrice = (price: string | number) => new Intl.NumberFormat('fr-FR').format(Number(price))

  const handleSignOut = async () => {
    await logout()
    navigate('/')
  }

  const currentPromo = promos[currentPromoIndex]

  return (
    <>
      {/* Header mobile compact - Toujours visible sauf sur homepage (où il apparaît au scroll) */}
      <div className={`md:hidden fixed top-0 left-0 right-0 bg-[#0f4c2b] z-[100] shadow-md transition-all duration-300 ease-out ${!isHomePage || isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Icône gauche */}
          <button
            className="p-1.5 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo centré */}
          <Link to="/" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src="/logo.svg" alt="Buy More" className="h-8 w-auto" />
          </Link>

          {/* Icônes droite */}
          <div className="flex items-center gap-3">
            <button className="p-1.5 text-white transition-all duration-200 transform hover:scale-110 active:scale-95">
              <Search size={20} className="transform transition-transform" />
            </button>
            <Link to="/cart" className="p-1.5 text-white transition-all duration-200 transform hover:scale-110 active:scale-95 relative">
              <ShoppingCart size={20} className="transform transition-transform" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e8d20c] text-[#0f4c2b] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {getItemCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant pour le header compact */}
      {isMenuOpen && (!isHomePage || isScrolled) && (
        <div className="md:hidden fixed top-12 left-0 right-0 bg-[#1a5f3a] z-[99] shadow-lg max-h-[70vh] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="p-4 border-b border-[#236b45]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e8d20c]"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </form>

          {/* Mobile Links */}
          <div className="py-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Accueil
            </Link>
            <Link
              to="/shops"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Store className="w-5 h-5" />
              Boutiques
            </Link>
            <Link
              to="/categories"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Tag className="w-5 h-5" />
              Catégories
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Package className="w-5 h-5" />
              Produits
            </Link>
            <Link
              to="/deals"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-lg">🔥</span>
              Promotions
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-lg">ℹ️</span>
              À propos
            </Link>
          </div>

          {/* User Actions */}
          <div className="border-t border-[#236b45] py-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-[#e8d20c] flex items-center justify-center text-[#0f4c2b] font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  Mon compte
                </Link>
                {user.is_seller && (
                  <Link
                    to="/vendor/shops"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Store className="w-5 h-5" />
                    Mes boutiques
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-[#236b45] transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#236b45] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-3 px-4 py-3 text-[#e8d20c] hover:bg-[#236b45] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navbar mobile en bas de l'écran - Version améliorée avec structure d'origine */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f4c2b] z-[100] shadow-md border-t border-[#e8d20c]/20">
        <div className="flex justify-around items-center py-1.5 px-0.5">
          <NavLink to="/"
            className={({ isActive }) => `
              flex flex-col items-center px-1 py-0.5 rounded-lg transition-all
              ${isActive
                ? 'text-[#e8d20c] font-medium scale-105'
                : 'text-white hover:text-[#e8d20c]/90'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-full ${isActive ? 'bg-[#0a3d21]/50' : ''} transition-all duration-200`}>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-[10px] mt-0.5 font-medium">Accueil</span>
              </>
            )}
          </NavLink>

          <NavLink to="/categories"
            className={({ isActive }) => `
              flex flex-col items-center px-1 py-0.5 rounded-lg transition-all
              ${isActive
                ? 'text-[#e8d20c] font-medium scale-105'
                : 'text-white hover:text-[#e8d20c]/90'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-full ${isActive ? 'bg-[#0a3d21]/50' : ''} transition-all duration-200`}>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-[10px] mt-0.5 font-medium">Catégories</span>
              </>
            )}
          </NavLink>

          <NavLink to="/shops"
            className={({ isActive }) => `
              flex flex-col items-center px-1 py-0.5 rounded-lg transition-all
              ${isActive
                ? 'text-[#e8d20c] font-medium scale-105'
                : 'text-white hover:text-[#e8d20c]/90'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-full ${isActive ? 'bg-[#0a3d21]/50' : ''} transition-all duration-200`}>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-[10px] mt-0.5 font-medium">Boutiques</span>
              </>
            )}
          </NavLink>

          <NavLink to="/favorites"
            className={({ isActive }) => `
              flex flex-col items-center px-1 py-0.5 rounded-lg transition-all relative
              ${isActive
                ? 'text-[#e8d20c] font-medium scale-105'
                : 'text-white hover:text-[#e8d20c]/90'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-full ${isActive ? 'bg-[#0a3d21]/50' : ''} transition-all duration-200 relative`}>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">0</span>
                </div>
                <span className="text-[10px] mt-0.5 font-medium">Favoris</span>
              </>
            )}
          </NavLink>

          {user ? (
            <NavLink to="/dashboard"
              className={({ isActive }) => `
                flex flex-col items-center px-1 py-0.5 rounded-lg transition-all relative
                ${isActive
                  ? 'text-[#e8d20c] font-medium scale-105'
                  : 'text-white hover:text-[#e8d20c]/90'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full ${isActive ? 'bg-[#0a3d21]/50' : ''} transition-all duration-200`}>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">Compte</span>
                </>
              )}
            </NavLink>
          ) : (
            <NavLink to="/login"
              className={({ isActive }) => `
                flex flex-col items-center px-1 py-0.5 rounded-lg transition-all relative
                ${isActive
                  ? 'text-[#e8d20c] font-medium scale-105'
                  : 'text-white hover:text-[#e8d20c]/90'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full ${isActive ? 'bg-[#0a3d21]/50' : ''} transition-all duration-200`}>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">Connexion</span>
                </>
              )}
            </NavLink>
          )}
        </div>
      </div>

      {/* Navbar compacte sticky - Toujours visible sauf sur homepage (où elle apparaît au scroll) */}
      <div className={`hidden md:block fixed top-0 left-0 right-0 z-[100] bg-[#0f4c2b] shadow-lg transition-transform duration-300 ${!isHomePage || isScrolled ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo compact */}
            <Link to="/" className="flex-shrink-0">
              <img src="/logo.svg" alt="Buy More" className="h-10 w-auto" />
            </Link>

            {/* Barre de recherche compacte */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
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
              <div
                className="relative"
                onMouseEnter={handleShopsMegaMenuEnter}
                onMouseLeave={handleShopsMegaMenuLeave}
              >
                <Link to="/shops" className="text-white hover:text-[#e8d20c] transition-colors font-medium flex items-center gap-1 py-2">
                  Boutiques
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Mega Menu des boutiques - Header sticky */}
                {showShopsMegaMenu && shops.length > 0 && (!isHomePage || isScrolled) && (
                  <div className="absolute top-full left-0 pt-2 w-[600px] z-[110]">
                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Nos Boutiques</h3>
                        <p className="text-sm text-gray-600">Découvrez nos boutiques partenaires</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 p-4 max-h-[400px] overflow-y-auto">
                        {shops.map((shop) => (
                          <Link
                            key={shop.id}
                            to={`/shops/${shop.id}`}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            onClick={() => setShowShopsMegaMenu(false)}
                          >
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 overflow-hidden group-hover:ring-2 group-hover:ring-[#0f4c2b] transition-all">
                              {shop.logo_url ? (
                                <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl font-bold text-[#0f4c2b]">{shop.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 text-center line-clamp-2 group-hover:text-[#0f4c2b]">
                              {shop.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <Link
                          to="/shops"
                          className="block text-center text-sm font-semibold text-[#0f4c2b] hover:text-[#1a5f3a]"
                          onClick={() => setShowShopsMegaMenu(false)}
                        >
                          Voir toutes les boutiques →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={handleCategoriesMegaMenuEnter}
                onMouseLeave={handleCategoriesMegaMenuLeave}
              >
                <Link to="/categories" className="text-white hover:text-[#e8d20c] transition-colors font-medium flex items-center gap-1 py-2">
                  Catégories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Mega Menu des catégories - Header sticky */}
                {showCategoriesMegaMenu && (!isHomePage || isScrolled) && (
                  <div className="absolute top-full left-0 pt-2 w-[500px] z-[110]">
                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Nos Catégories</h3>
                        <p className="text-sm text-gray-600">Explorez nos différentes catégories</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 p-4">
                        {dynamicCategories.length > 0 ? dynamicCategories.slice(0, 8).map((cat) => {
                          const categoryImages: Record<string, string> = {
                            'electronique': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
                            'mode': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop',
                            'alimentaire': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
                            'parfumerie': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
                            'cuisine': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
                            'sport': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop',
                            'electromenager': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&h=100&fit=crop',
                            'maison': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
                          }
                          // Priority: icon > image > fallback
                          const imgUrl = cat.icon || cat.image || categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
                          return (
                            <Link
                              key={cat.id}
                              to={`/products?category=${cat.slug}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                              onClick={() => setShowCategoriesMegaMenu(false)}
                            >
                              <div className="w-12 h-12 rounded-xl overflow-hidden">
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">{cat.name}</span>
                            </Link>
                          )
                        }) : (
                          <>
                            <Link to="/products?category=electronique" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group" onClick={() => setShowCategoriesMegaMenu(false)}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" /></div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">Électronique</span>
                            </Link>
                            <Link to="/products?category=mode" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group" onClick={() => setShowCategoriesMegaMenu(false)}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" /></div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">Mode & Habillement</span>
                            </Link>
                            <Link to="/products?category=alimentaire" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group" onClick={() => setShowCategoriesMegaMenu(false)}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" /></div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">Alimentaires</span>
                            </Link>
                            <Link to="/products?category=parfumerie" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group" onClick={() => setShowCategoriesMegaMenu(false)}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" /></div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">Parfumerie</span>
                            </Link>
                            <Link to="/products?category=cuisine" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group" onClick={() => setShowCategoriesMegaMenu(false)}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" /></div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">Cuisine & Aménagement</span>
                            </Link>
                            <Link to="/products?category=sport" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group" onClick={() => setShowCategoriesMegaMenu(false)}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" /></div>
                              <span className="font-medium text-gray-700 group-hover:text-green-600">Sport & Loisirs</span>
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <Link
                          to="/categories"
                          className="block text-center text-sm font-semibold text-[#0f4c2b] hover:text-[#1a5f3a]"
                          onClick={() => setShowCategoriesMegaMenu(false)}
                        >
                          Voir toutes les catégories →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

            {/* Icônes compactes */}
            <div className="flex items-center gap-3">
              <Link to="/favorites" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-white" />
                {getFavoritesCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {getFavoritesCount()}
                  </span>
                )}
              </Link>

              {/* Notification Bell - only for logged in users */}
              {user && <NotificationBell variant="dark" />}

              <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <ShoppingCart className="w-5 h-5 text-white" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e8d20c] text-[#0f4c2b] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8d20c] to-[#d4c00b] flex items-center justify-center text-[#0f4c2b] font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100">
                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-50 rounded-t-lg">Mon compte</Link>
                    {user.is_seller && (
                      <>
                        <Link to="/vendor/shops" className="block px-4 py-2 hover:bg-gray-50">Mes boutiques</Link>
                        <Link to="/vendor/products" className="block px-4 py-2 hover:bg-gray-50">Mes produits</Link>
                      </>
                    )}
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg flex items-center gap-2 text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <button className="px-4 py-2 rounded-full bg-white text-[#0f4c2b] text-sm font-semibold hover:bg-gray-100 transition-colors">
                    Connexion
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navbar principale - Affichée uniquement sur la homepage, masquée lors du scroll */}
      {isHomePage && (
        <nav className={`bg-[#0f4c2b] text-white sticky top-0 z-50 shadow-lg transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
          {/* Barre de publicité animée avec slider - Design impactant */}
          <div className={`bg-gradient-to-r ${currentPromo.bgColor} text-white py-4 overflow-hidden transition-all duration-700 relative`}>
            {/* Effet de brillance animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="flex items-center justify-between gap-4">
                {/* Contenu principal avec émoji animé */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Émoji animé grand format */}
                  <div className="text-5xl md:text-6xl animate-bounce-slow hidden sm:block">
                    {currentPromo.emoji}
                  </div>

                  {/* Textes en gros caractères */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="sm:hidden text-3xl animate-pulse">{currentPromo.emoji}</span>
                      <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight animate-slide-in">
                        {currentPromo.title}
                      </h2>
                    </div>
                    <p className="text-xs md:text-base font-medium mt-1 text-white/90 hidden md:block">
                      {currentPromo.subtitle}
                    </p>
                  </div>
                </div>

                {/* CTA et indicateurs */}
                <div className="flex items-center gap-4">
                  <Link
                    to={currentPromo.link}
                    className="text-sm md:text-base font-bold bg-white text-gray-900 px-6 py-2.5 md:px-8 md:py-3 rounded-full hover:scale-105 hover:shadow-2xl transition-all duration-300 whitespace-nowrap animate-pulse-slow"
                  >
                    {currentPromo.buttonText} →
                  </Link>

                  {/* Indicateurs de pagination */}
                  <div className="hidden lg:flex items-center gap-2">
                    {promos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPromoIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentPromoIndex
                          ? 'bg-white w-8 shadow-lg'
                          : 'bg-white/40 w-2 hover:bg-white/70 hover:w-4'
                          }`}
                        aria-label={`Aller à la promotion ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            {/* Ligne 1: Logo centré */}
            <div className="flex items-center justify-center py-6">
              <Link to="/" className="inline-flex items-center">
                <img src="/logo.svg" alt="Buy More" className="h-24 w-auto" />
              </Link>
            </div>

            {/* Ligne 2 Desktop: Recherche centrée */}
            <div className="hidden md:flex flex-col items-center pb-4 border-t border-[#1a5f3a] pt-4">
              {/* Barre de recherche moderne - Style unifié */}
              <div className="w-full max-w-3xl mx-auto mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowSearchSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                      placeholder="Rechercher des produits, boutiques ou catégories..."
                      className="w-full pl-4 pr-12 py-3 rounded-full border-2 border-white/20 bg-white text-gray-800 text-base focus:outline-none focus:border-[#e8d20c] transition-colors"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#e8d20c] hover:bg-[#d4c00b] text-[#0f4c2b] px-5 py-2 rounded-full font-medium transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Suggestions de recherche dynamiques */}
                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100 max-h-[400px] overflow-y-auto">
                    {isSearching ? (
                      <div className="px-4 py-6 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-[#0f4c2b] border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Recherche en cours...</p>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <>
                        {/* Produits */}
                        {searchSuggestions.filter(s => s.type === 'product').length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <Package className="w-3 h-3" /> Produits
                              </p>
                            </div>
                            {searchSuggestions.filter(s => s.type === 'product').map((suggestion) => (
                              <button
                                key={`product-${suggestion.id}`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 group"
                              >
                                {suggestion.image ? (
                                  <img src={suggestion.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#0f4c2b]">{suggestion.name}</p>
                                  {suggestion.price && (
                                    <p className="text-sm text-green-600 font-semibold">{formatPrice(suggestion.price)} FCFA</p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Boutiques */}
                        {searchSuggestions.filter(s => s.type === 'shop').length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <Store className="w-3 h-3" /> Boutiques
                              </p>
                            </div>
                            {searchSuggestions.filter(s => s.type === 'shop').map((suggestion) => (
                              <button
                                key={`shop-${suggestion.id}`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 group"
                              >
                                {suggestion.image ? (
                                  <img src={suggestion.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-green-600" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-900 group-hover:text-[#0f4c2b]">{suggestion.name}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Catégories */}
                        {searchSuggestions.filter(s => s.type === 'category').length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <Tag className="w-3 h-3" /> Catégories
                              </p>
                            </div>
                            {searchSuggestions.filter(s => s.type === 'category').map((suggestion) => (
                              <button
                                key={`cat-${suggestion.id}`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <Tag className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 group-hover:text-[#0f4c2b]">{suggestion.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : searchQuery.length >= 2 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-500">Aucun résultat pour "{searchQuery}"</p>
                      </div>
                    ) : (
                      <div>
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recherches populaires</p>
                        </div>
                        <div className="py-2">
                          {popularSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(search)
                                setShowSearchSuggestions(false)
                                navigate(`/products?search=${encodeURIComponent(search)}`)
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 group"
                            >
                              <Search className="w-4 h-4 text-gray-400 group-hover:text-[#0f4c2b]" />
                              <span className="text-gray-700 group-hover:text-[#0f4c2b]">{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Barre de navigation avec catégories et icônes */}
              <div className="w-full flex items-center justify-between max-w-6xl mx-auto">
                {/* Bouton Catégories */}
                <div className="relative">
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="flex items-center space-x-2 bg-[#1a5f3a] px-5 py-2.5 rounded-lg hover:bg-[#236b45] transition-colors whitespace-nowrap shadow-sm"
                  >
                    <Menu className="w-5 h-5" />
                    <span className="font-medium">Toutes les catégories</span>
                  </button>

                  {isCategoriesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white text-gray-900 rounded-lg shadow-xl z-50 overflow-hidden">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          to={`/shops?category=${encodeURIComponent(category)}`}
                          className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Liens de navigation */}
                <div className="flex items-center space-x-8">
                  <div
                    className="relative"
                    onMouseEnter={handleShopsMegaMenuEnter}
                    onMouseLeave={handleShopsMegaMenuLeave}
                  >
                    <Link to="/shops" className="hover:text-[#e8d20c] transition-colors font-medium flex items-center gap-1 py-2">
                      Boutiques
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>

                    {/* Mega Menu des boutiques - Homepage */}
                    {showShopsMegaMenu && shops.length > 0 && !isScrolled && (
                      <div className="absolute top-full left-0 pt-2 w-[600px] z-[110]">
                        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Nos Boutiques</h3>
                            <p className="text-sm text-gray-600">Découvrez nos boutiques partenaires</p>
                          </div>
                          <div className="grid grid-cols-3 gap-3 p-4 max-h-[400px] overflow-y-auto">
                            {shops.map((shop) => (
                              <Link
                                key={shop.id}
                                to={`/shops/${shop.id}`}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                onClick={() => setShowShopsMegaMenu(false)}
                              >
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 overflow-hidden group-hover:ring-2 group-hover:ring-[#0f4c2b] transition-all">
                                  {shop.logo_url ? (
                                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-2xl font-bold text-[#0f4c2b]">{shop.name.charAt(0)}</span>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-900 text-center line-clamp-2 group-hover:text-[#0f4c2b]">
                                  {shop.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <Link
                              to="/shops"
                              className="block text-center text-sm font-semibold text-[#0f4c2b] hover:text-[#1a5f3a]"
                              onClick={() => setShowShopsMegaMenu(false)}
                            >
                              Voir toutes les boutiques →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className="relative"
                    onMouseEnter={handleCategoriesMegaMenuEnter}
                    onMouseLeave={handleCategoriesMegaMenuLeave}
                  >
                    <Link to="/categories" className="hover:text-[#e8d20c] transition-colors font-medium flex items-center gap-1 py-2">
                      Catégories
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>

                    {/* Mega Menu des catégories */}
                    {showCategoriesMegaMenu && !isScrolled && (
                      <div className="absolute top-full left-0 pt-2 w-[500px] z-[110]">
                        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Nos Catégories</h3>
                            <p className="text-sm text-gray-600">Explorez nos différentes catégories</p>
                          </div>
                          <div className="grid grid-cols-2 gap-1 p-3 max-h-[400px] overflow-y-auto">
                            {dynamicCategories.slice(0, 12).map((category) => {
                              const categoryImages: Record<string, string> = {
                                'electronique': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&h=80&fit=crop',
                                'mode': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=80&h=80&fit=crop',
                                'alimentaire': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop',
                                'parfumerie': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop',
                                'cuisine': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop',
                                'sport': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=80&h=80&fit=crop',
                                'electromenager': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=80&h=80&fit=crop',
                                'maison': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=80&h=80&fit=crop',
                              }
                              const imgUrl = categoryImages[category.slug] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop`
                              return (
                                <Link
                                  key={category.id}
                                  to={`/products?category=${category.slug}`}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group/item"
                                  onClick={() => setShowCategoriesMegaMenu(false)}
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900 group-hover/item:text-[#0f4c2b] transition-colors">
                                      {category.name}
                                    </span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </Link>
                              )
                            })}
                          </div>
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <Link
                              to="/categories"
                              className="block text-center text-sm font-semibold text-[#0f4c2b] hover:text-[#1a5f3a]"
                              onClick={() => setShowCategoriesMegaMenu(false)}
                            >
                              Voir toutes les catégories →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/products" className="hover:text-[#e8d20c] transition-colors font-medium">
                    Produits
                  </Link>
                  <Link to="/deals" className="hover:text-[#e8d20c] transition-colors font-medium">
                    Promotions
                  </Link>
                  <Link to="/about" className="hover:text-[#e8d20c] transition-colors font-medium">
                    À propos
                  </Link>
                </div>

                {/* Icônes et menu utilisateur */}
                <div className="flex items-center space-x-3">
                  {/* Wishlist - Design moderne */}
                  <Link
                    to="/favorites"
                    className="relative group p-2.5 rounded-full hover:bg-white/10 transition-all duration-200"
                  >
                    <Heart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      0
                    </span>
                  </Link>

                  {/* Panier - Design moderne */}
                  <Link
                    to="/cart"
                    className="relative group p-2.5 rounded-full hover:bg-white/10 transition-all duration-200"
                  >
                    <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    {getItemCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#e8d20c] to-[#d4c00b] text-[#0f4c2b] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                        {getItemCount()}
                      </span>
                    )}
                  </Link>

                  {/* User Menu - Design moderne */}
                  {user ? (
                    <div className="relative group">
                      <button className="flex items-center space-x-2 p-2.5 rounded-full hover:bg-white/10 transition-all duration-200">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8d20c] to-[#d4c00b] flex items-center justify-center text-[#0f4c2b] font-bold text-sm shadow-md">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="hidden lg:block font-medium">{user.username}</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 rounded-t-md"
                        >
                          Mon compte
                        </Link>
                        {user.is_seller && (
                          <>
                            <Link
                              to="/vendor/shops"
                              className="block px-4 py-2 hover:bg-gray-100"
                            >
                              Mes boutiques
                            </Link>
                            <Link
                              to="/vendor/products"
                              className="block px-4 py-2 hover:bg-gray-100"
                            >
                              Mes produits
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md flex items-center space-x-2 text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link to="/login">
                      <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-white to-gray-50 text-[#0f4c2b] font-semibold hover:from-gray-50 hover:to-white transition-all duration-200 shadow-md hover:shadow-lg">
                        <span>Connexion</span>
                      </button>
                    </Link>
                  )}

                </div>
              </div>
            </div>

            {/* Bouton menu pour mobile */}
            <div className="flex md:hidden items-center justify-between py-3 border-t border-[#1a5f3a]">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:text-[#e8d20c] transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-[#1a5f3a] border-t border-[#236b45]">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit"
                    className="w-full px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e8d20c]"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </form>

              {/* Mobile Categories */}
              <div className="px-4 pb-2">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="w-full flex items-center justify-between py-2 text-[#e8d20c]"
                >
                  <span>Catégories</span>
                  <Menu className="w-5 h-5" />
                </button>
                {isCategoriesOpen && (
                  <div className="mt-2 space-y-2 pl-4">
                    {categories.map((category, index) => (
                      <Link
                        key={index}
                        to={`/shops?category=${encodeURIComponent(category)}`}
                        className="block py-2 hover:text-[#e8d20c]"
                        onClick={() => {
                          setIsCategoriesOpen(false)
                          setIsMenuOpen(false)
                        }}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Links */}
              <div className="px-4 pb-4 space-y-2">
                <Link
                  to="/shops"
                  className="block py-2 hover:text-[#e8d20c]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Boutiques
                </Link>
                <Link
                  to="/categories"
                  className="block py-2 hover:text-[#e8d20c]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Catégories
                </Link>
                <Link
                  to="/products"
                  className="block py-2 hover:text-[#e8d20c]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Produits
                </Link>
                <Link
                  to="/deals"
                  className="block py-2 hover:text-[#e8d20c]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Promotions
                </Link>
                <Link
                  to="/about"
                  className="block py-2 hover:text-[#e8d20c]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  À propos
                </Link>
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  )
}
