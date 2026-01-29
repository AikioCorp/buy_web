import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, ShoppingCart, Heart, X, SlidersHorizontal, Star, Package } from 'lucide-react'
import { productsService, Product } from '../lib/api/productsService'
import { categoriesService } from '../lib/api/categoriesService'

interface CategoryItem {
  id: number
  name: string
  slug: string
}

// Produits fictifs
const mockProducts: any[] = [
  { id: 101, name: 'iPhone 15 Pro Max', base_price: '850000', slug: 'iphone-15-pro-max', category: { id: 1, name: 'Électronique', slug: 'electronique' }, store: { id: 1, name: 'Tech Store Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 102, name: 'AirPods Pro 2', base_price: '175000', slug: 'airpods-pro-2', category: { id: 1, name: 'Électronique', slug: 'electronique' }, store: { id: 1, name: 'Tech Store Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 103, name: 'Robe Africaine Wax', base_price: '35000', slug: 'robe-africaine-wax', category: { id: 2, name: 'Mode', slug: 'mode' }, store: { id: 2, name: 'Mode Bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 104, name: 'Nike Air Max 270', base_price: '95000', slug: 'nike-air-max-270', category: { id: 3, name: 'Sport', slug: 'sport' }, store: { id: 3, name: 'Sport Plus' }, media: [{ image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 105, name: 'Apple Watch Series 9', base_price: '350000', slug: 'apple-watch-series-9', category: { id: 1, name: 'Électronique', slug: 'electronique' }, store: { id: 1, name: 'Tech Store Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 106, name: 'Parfum Dior Sauvage', base_price: '145000', slug: 'parfum-dior-sauvage', category: { id: 4, name: 'Parfumerie', slug: 'parfumerie' }, store: { id: 11, name: 'Dicarlo' }, media: [{ image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 107, name: 'Set Casseroles Inox', base_price: '65000', slug: 'set-casseroles-inox', category: { id: 5, name: 'Cuisine', slug: 'cuisine' }, store: { id: 10, name: 'Orca' }, media: [{ image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 108, name: 'Riz Parfumé Thaï 5kg', base_price: '12500', slug: 'riz-parfume-thai', category: { id: 6, name: 'Alimentaire', slug: 'alimentaire' }, store: { id: 9, name: 'Shopreate' }, media: [{ image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 109, name: 'MacBook Air M3', base_price: '1200000', slug: 'macbook-air-m3', category: { id: 1, name: 'Électronique', slug: 'electronique' }, store: { id: 1, name: 'Tech Store Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 110, name: 'Boubou Bazin Riche', base_price: '75000', slug: 'boubou-bazin-riche', category: { id: 2, name: 'Mode', slug: 'mode' }, store: { id: 2, name: 'Mode Bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 111, name: 'Samsung Galaxy S24', base_price: '950000', slug: 'samsung-galaxy-s24', category: { id: 1, name: 'Électronique', slug: 'electronique' }, store: { id: 1, name: 'Tech Store Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 112, name: 'TV Samsung 55" 4K', base_price: '450000', slug: 'tv-samsung-55', category: { id: 7, name: 'Électroménager', slug: 'electromenager' }, store: { id: 7, name: 'Électro Bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 113, name: 'Climatiseur 12000 BTU', base_price: '285000', slug: 'climatiseur-12000-btu', category: { id: 7, name: 'Électroménager', slug: 'electromenager' }, store: { id: 7, name: 'Électro Bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 114, name: 'Canapé 3 Places', base_price: '350000', slug: 'canape-3-places', category: { id: 8, name: 'Maison', slug: 'maison' }, store: { id: 5, name: 'Maison & Déco' }, media: [{ image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 115, name: 'Miel Pays Dogon 1kg', base_price: '15000', slug: 'miel-pays-dogon', category: { id: 6, name: 'Alimentaire', slug: 'alimentaire' }, store: { id: 6, name: 'Saveurs du Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 116, name: 'Ballon Adidas Pro', base_price: '35000', slug: 'ballon-adidas-pro', category: { id: 3, name: 'Sport', slug: 'sport' }, store: { id: 3, name: 'Sport Plus' }, media: [{ image_url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 117, name: 'Parfum Chanel N°5', base_price: '185000', slug: 'parfum-chanel-n5', category: { id: 4, name: 'Parfumerie', slug: 'parfumerie' }, store: { id: 4, name: 'Beauté Plus' }, media: [{ image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 118, name: 'Robot Cuisine', base_price: '125000', slug: 'robot-cuisine', category: { id: 5, name: 'Cuisine', slug: 'cuisine' }, store: { id: 10, name: 'Orca' }, media: [{ image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 119, name: 'Chemise Bogolan', base_price: '28000', slug: 'chemise-bogolan', category: { id: 2, name: 'Mode', slug: 'mode' }, store: { id: 8, name: 'Tendance Afrique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 120, name: 'JBL Flip 6', base_price: '85000', slug: 'jbl-flip-6', category: { id: 1, name: 'Électronique', slug: 'electronique' }, store: { id: 1, name: 'Tech Store Mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', is_primary: true }] },
]

// Catégories fictives
const mockCategories: CategoryItem[] = [
  { id: 1, name: 'Électronique', slug: 'electronique' },
  { id: 2, name: 'Mode', slug: 'mode' },
  { id: 3, name: 'Sport', slug: 'sport' },
  { id: 4, name: 'Parfumerie', slug: 'parfumerie' },
  { id: 5, name: 'Cuisine', slug: 'cuisine' },
  { id: 6, name: 'Alimentaire', slug: 'alimentaire' },
  { id: 7, name: 'Électroménager', slug: 'electromenager' },
  { id: 8, name: 'Maison', slug: 'maison' },
]

// Helper to get price as number
const getPrice = (product: Product): number => {
  return parseFloat(product.base_price) || 0
}

// Helper to get image URL
const getImageUrl = (product: Product): string | undefined => {
  if (!product.media || product.media.length === 0) return undefined
  const primaryImage = product.media.find(m => m.is_primary) || product.media[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return undefined
  // Convertir http:// en https:// pour éviter le blocage mixed content
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
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
      
      if (response.data?.results && response.data.results.length > 0) {
        setProducts(response.data.results)
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        setProducts(response.data)
      } else {
        // Fallback sur les produits fictifs
        let filtered = mockProducts
        if (category) {
          filtered = mockProducts.filter(p => p.category?.slug === category)
        }
        if (search) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        }
        setProducts(filtered as Product[])
      }
    } catch (error) {
      // Fallback sur les produits fictifs
      setProducts(mockProducts as Product[])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories()
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data)
      } else {
        setCategories(mockCategories)
      }
    } catch (error) {
      setCategories(mockCategories)
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
