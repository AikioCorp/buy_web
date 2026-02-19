import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, ShoppingCart, Heart, X, SlidersHorizontal, Star, Package, ChevronDown, ChevronUp, Tag, DollarSign } from 'lucide-react'
import { Product } from '../lib/api/productsService'
import { categoriesService } from '../lib/api/categoriesService'
import productCacheService from '../services/productCache.service'
import { useFavoritesStore } from '../store/favoritesStore'
import { useToast } from '../components/Toast'

interface CategoryItem {
  id: number
  name: string
  slug: string
}


// Helper to get price as number
const getPrice = (product: Product): number => {
  return parseFloat(product.base_price) || 0
}

// Helper to get image URL
const getImageUrl = (product: Product): string | undefined => {
  // Backend returns 'images' from product_media, but interface uses 'media'
  const mediaArray = product.media || (product as any).images || []
  if (!mediaArray || mediaArray.length === 0) return undefined
  const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return undefined
  // Convertir http:// en https:// pour éviter le blocage mixed content
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [showCategorySection, setShowCategorySection] = useState(true)
  const [showPriceSection, setShowPriceSection] = useState(true)
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryItem[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { showToast } = useToast()

  useEffect(() => {
    setProducts([])
    setCurrentPage(0)
    setHasMore(true)
    loadProducts(0)
    loadCategories()
  }, [searchParams])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, currentPage])

  const loadProducts = async (page: number) => {
    try {
      if (page === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const category = searchParams.get('category') || ''
      const search = searchParams.get('search') || ''
      setSelectedCategory(category)
      setSearchQuery(search)
      
      // Utiliser le service de cache avec pagination
      const filters: any = {}
      if (search) filters.search = search
      if (category) {
        // Utiliser directement le slug de la catégorie
        filters.category_slug = category
      }
      
      const response = await productCacheService.getProductsPage(page, filters)
      
      if (page === 0) {
        setProducts(response.results as any)
        setTotalCount(response.count)
      } else {
        setProducts(prev => [...prev, ...response.results] as any)
      }
      
      setHasMore(response.results.length === 100)
      setCurrentPage(page)
      
    } catch (error) {
      console.error('Error loading products:', error)
      if (page === 0) {
        setProducts([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadProducts(currentPage + 1)
    }
  }, [currentPage, loadingMore, hasMore])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories()
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
        setCategoriesWithProducts(response.data)
      } else {
        setCategories([])
        setCategoriesWithProducts([])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
      setCategoriesWithProducts([])
    }
  }

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    if (categorySlug) {
      searchParams.set('category', categorySlug)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      searchParams.set('search', searchQuery)
    } else {
      searchParams.delete('search')
    }
    setSearchParams(searchParams)
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getDiscount = (price: number, compareAt?: number) => {
    if (!compareAt || compareAt <= price) return 0
    return Math.round((1 - price / compareAt) * 100)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const productPrice = getPrice(product)
    const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1]
    return matchesSearch && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return getPrice(a) - getPrice(b)
      case 'price-desc': return getPrice(b) - getPrice(a)
      case 'name': return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] text-white pt-4">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-wider uppercase">
              Nos <span className="text-[#e8d20c]">Produits</span>
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Découvrez notre sélection de produits de qualité à prix compétitifs
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full px-6 py-4 pl-14 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-[#e8d20c]/50 shadow-xl"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#0f4c2b] text-white rounded-full font-medium hover:bg-[#1a5f3a] transition-colors"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>
        
        {/* Wave */}
        <div className="h-12 bg-gray-50" style={{ 
          clipPath: 'ellipse(70% 100% at 50% 100%)',
          marginTop: '-1px'
        }}></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop - Modern Design */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg sticky top-24 overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <SlidersHorizontal size={22} className="animate-pulse" />
                    Filtres
                  </h3>
                  <p className="text-white/90 text-sm mt-1">Affinez votre recherche</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Categories Section */}
                <div className="border-b border-gray-100 pb-6">
                  <button
                    onClick={() => setShowCategorySection(!showCategorySection)}
                    className="w-full flex items-center justify-between mb-4 group"
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-[#0f4c2b]" />
                      <h4 className="font-semibold text-gray-900">Catégories</h4>
                    </div>
                    {showCategorySection ? 
                      <ChevronUp size={18} className="text-gray-400 group-hover:text-[#0f4c2b] transition-colors" /> : 
                      <ChevronDown size={18} className="text-gray-400 group-hover:text-[#0f4c2b] transition-colors" />
                    }
                  </button>
                  
                  {showCategorySection && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => handleCategoryChange('')}
                        className={`group w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all transform hover:scale-[1.02] ${
                          !selectedCategory 
                            ? 'bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white shadow-lg shadow-green-500/30' 
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 border border-gray-200 hover:border-[#0f4c2b]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              !selectedCategory ? 'bg-white' : 'bg-gray-400 group-hover:bg-[#0f4c2b]'
                            }`}></span>
                            Toutes les catégories
                          </span>
                          {!selectedCategory && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">✓</span>}
                        </div>
                      </button>
                      {categoriesWithProducts.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`group w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all transform hover:scale-[1.02] ${
                            selectedCategory === cat.slug 
                              ? 'bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white shadow-lg shadow-green-500/30' 
                              : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 border border-gray-200 hover:border-[#0f4c2b]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full transition-all ${
                                selectedCategory === cat.slug ? 'bg-white' : 'bg-gray-400 group-hover:bg-[#0f4c2b]'
                              }`}></span>
                              {cat.name}
                            </span>
                            {selectedCategory === cat.slug && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Price Range Section */}
                <div>
                  <button
                    onClick={() => setShowPriceSection(!showPriceSection)}
                    className="w-full flex items-center justify-between mb-4 group"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-[#0f4c2b]" />
                      <h4 className="font-semibold text-gray-900">Fourchette de prix</h4>
                    </div>
                    {showPriceSection ? 
                      <ChevronUp size={18} className="text-gray-400 group-hover:text-[#0f4c2b] transition-colors" /> : 
                      <ChevronDown size={18} className="text-gray-400 group-hover:text-[#0f4c2b] transition-colors" />
                    }
                  </button>
                  
                  {showPriceSection && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Min (FCFA)</label>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                        <div className="text-gray-400 mt-5">—</div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Max (FCFA)</label>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent"
                            placeholder="1000000"
                          />
                        </div>
                      </div>
                      
                      {/* Quick price filters */}
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Filtres rapides:</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setPriceRange([0, 50000])}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#0f4c2b] hover:to-[#1a5f3a] hover:text-white rounded-full transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            &lt; 50K
                          </button>
                          <button
                            onClick={() => setPriceRange([50000, 100000])}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#0f4c2b] hover:to-[#1a5f3a] hover:text-white rounded-full transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            50K - 100K
                          </button>
                          <button
                            onClick={() => setPriceRange([100000, 500000])}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#0f4c2b] hover:to-[#1a5f3a] hover:text-white rounded-full transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            100K - 500K
                          </button>
                          <button
                            onClick={() => setPriceRange([500000, 1000000])}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#0f4c2b] hover:to-[#1a5f3a] hover:text-white rounded-full transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            &gt; 500K
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Filters Button */}
                {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                  <button
                    onClick={() => {
                      handleCategoryChange('');
                      setPriceRange([0, 1000000]);
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl text-sm font-semibold hover:from-red-100 hover:to-red-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-sm hover:shadow-md border border-red-200"
                  >
                    <X size={16} className="animate-spin" />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#0f4c2b] text-white rounded-lg hover:bg-[#1a5f3a] transition-colors"
                >
                  <Filter size={18} />
                  Filtres
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c2b]"
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </select>
                
                {/* View Mode */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#0f4c2b] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#0f4c2b] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0f4c2b]/10 text-[#0f4c2b] rounded-full text-sm">
                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button onClick={() => handleCategoryChange('')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0f4c2b]/10 text-[#0f4c2b] rounded-full text-sm">
                    "{searchQuery}"
                    <button onClick={() => { setSearchQuery(''); searchParams.delete('search'); setSearchParams(searchParams); }}>
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-2.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos filtres</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    {/* Image - Smaller aspect ratio */}
                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                      {getImageUrl(product) ? (
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <button 
                        className={`absolute top-1.5 right-1.5 p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity ${
                          isFavorite(product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/90 hover:bg-red-50 hover:text-red-500'
                        }`}
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation();
                          const added = toggleFavorite(product);
                          showToast(added ? 'Ajouté aux favoris !' : 'Retiré des favoris', 'success');
                        }}
                      >
                        <Heart size={14} className={isFavorite(product.id) ? 'fill-current' : ''} />
                      </button>

                      {/* Stock badge */}
                      {(product.stock ?? 0) > 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded">
                          En stock
                        </span>
                      )}
                    </div>
                    
                    {/* Content - More compact */}
                    <div className="p-2.5">
                      {product.store && (
                        <span className="text-[10px] text-gray-400 truncate block">
                          {product.store.name}
                        </span>
                      )}
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-[#0f4c2b] transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#0f4c2b]">
                          {formatPrice(getPrice(product))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    className="group flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* Image */}
                    <div className="relative w-40 h-40 flex-shrink-0 bg-gray-100">
                      {getImageUrl(product) ? (
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      {product.category && (
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#0f4c2b] transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">{product.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-xl text-[#0f4c2b]">
                          {formatPrice(getPrice(product))}
                        </span>
                        
                        <button className="px-4 py-2 bg-[#0f4c2b] text-white rounded-lg font-medium hover:bg-[#1a5f3a] transition-colors flex items-center gap-2">
                          <ShoppingCart size={18} />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Infinite Scroll Loader */}
            {!loading && hasMore && (
              <div ref={observerTarget} className="py-8 text-center">
                {loadingMore ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f4c2b]"></div>
                    <p className="text-gray-600">Chargement de plus de produits...</p>
                  </div>
                ) : (
                  <div className="h-20"></div>
                )}
              </div>
            )}

            {/* End of products message */}
            {!loading && !hasMore && products.length > 0 && (
              <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full">
                  <Package size={20} />
                  <span className="font-medium">Tous les {products.length} produits ont été chargés</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filtres</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
              <div className="space-y-2">
                <button
                  onClick={() => { handleCategoryChange(''); setShowFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory ? 'bg-[#0f4c2b] text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { handleCategoryChange(cat.slug); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.slug ? 'bg-[#0f4c2b] text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
