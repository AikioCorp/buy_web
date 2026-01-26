import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, ShoppingCart, Heart, X, SlidersHorizontal } from 'lucide-react'
import { productsService, Product } from '../lib/api/productsService'
import { categoriesService } from '../lib/api/categoriesService'

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
  return product.media?.[0]?.image_url
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [searchParams])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const category = searchParams.get('category') || ''
      const search = searchParams.get('search') || ''
      setSelectedCategory(category)
      setSearchQuery(search)
      
      const response = await productsService.getProducts({ 
        page: 1,
        search,
        category_slug: category || undefined
      })
      
      if (response.data?.results) {
        setProducts(response.data.results)
      } else if (Array.isArray(response.data)) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories()
      if (response.data) {
        setCategories(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
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
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      searchParams.set('search', searchQuery)
    } else {
      searchParams.delete('search')
    }
    setSearchParams(searchParams)
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
      <div className="bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
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
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Filtres
              </h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory ? 'bg-[#0f4c2b] text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug ? 'bg-[#0f4c2b] text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Prix</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
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
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  <Filter size={18} />
                  Filtres
                </button>
                <span className="text-gray-600">
                  <strong className="text-[#0f4c2b]">{sortedProducts.length}</strong> produits
                </span>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {getImageUrl(product) ? (
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-[#0f4c2b] hover:text-white transition-colors">
                          <Heart size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      {product.category && (
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="font-medium text-gray-900 line-clamp-2 mt-1 group-hover:text-[#0f4c2b] transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-bold text-lg text-[#0f4c2b]">
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
