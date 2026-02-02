import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Store, Search, MapPin, Star, ArrowRight, Grid, List } from 'lucide-react'
import { shopsService, Shop } from '../lib/api/shopsService'


export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    loadShops()
  }, [searchParams])

  // Boutiques de fallback pour affichage si API vide
  const fallbackShops: Shop[] = [
    { id: 9, name: 'Shopreate', slug: 'shopreate', logo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop', city: 'Bamako', is_active: true },
    { id: 10, name: 'Orca', slug: 'orca', logo_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop', city: 'Bamako', is_active: true },
    { id: 11, name: 'Dicarlo', slug: 'dicarlo', logo_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop', city: 'Bamako', is_active: true },
    { id: 12, name: 'Carré Marché', slug: 'carre-marche', logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop', city: 'Bamako', is_active: true },
    { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali', logo_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop', city: 'Bamako', is_active: true },
    { id: 2, name: 'Mode Bamako', slug: 'mode-bamako', logo_url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop', city: 'Bamako', is_active: true },
  ]

  const loadShops = async () => {
    try {
      setLoading(true)
      const search = searchParams.get('search') || ''
      setSearchQuery(search)
      
      const response = await shopsService.getPublicShops(1, 50)
      console.log('ShopsPage loadShops response:', response)
      
      if (response.data?.results && response.data.results.length > 0) {
        console.log('ShopsPage: Using API shops, count:', response.data.results.length)
        setShops(response.data.results)
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('ShopsPage: Using array format, count:', response.data.length)
        setShops(response.data)
      } else {
        console.log('ShopsPage: No API shops, using fallback')
        setShops(fallbackShops)
      }
    } catch (error) {
      console.error('Erreur chargement boutiques:', error)
      setShops(fallbackShops)
    } finally {
      setLoading(false)
    }
  }

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">
              DÉCOUVREZ NOS <span className="text-[#e8d20c]">BOUTIQUES</span>
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Explorez une sélection de boutiques partenaires offrant des produits de qualité
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une boutique..."
                className="w-full px-6 py-4 pl-14 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-[#e8d20c]/50 shadow-xl"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="h-16 bg-gray-50" style={{ 
          clipPath: 'ellipse(70% 100% at 50% 100%)',
          marginTop: '-1px'
        }}></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <strong className="text-[#0f4c2b]">{filteredShops.length}</strong> boutiques trouvées
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#0f4c2b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#0f4c2b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune boutique trouvée</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <Link 
                key={shop.id} 
                to={`/shops/${shop.slug || shop.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Banner/Logo */}
                <div className="relative h-40 bg-gradient-to-br from-[#0f4c2b]/10 to-[#e8d20c]/10">
                  {(shop.banner_url || shop.banner) ? (
                    <img src={shop.banner_url || shop.banner} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                        {(shop.logo_url || shop.logo) ? (
                          <img src={shop.logo_url || shop.logo} alt={shop.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-[#0f4c2b]">{shop.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {shop.is_active && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Ouvert
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#0f4c2b] transition-colors">
                    {shop.name}
                  </h3>
                  
                  {shop.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {shop.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {shop.city && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{shop.city}</span>
                      </div>
                    )}
                    
                    {shop.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{shop.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-[#0f4c2b] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Visiter la boutique</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredShops.map((shop) => (
              <Link 
                key={shop.id} 
                to={`/shops/${shop.slug || shop.id}`}
                className="group flex bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                {/* Logo */}
                <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-[#0f4c2b]/10 to-[#e8d20c]/10 flex items-center justify-center">
                  {(shop.logo_url || shop.logo) ? (
                    <img src={shop.logo_url || shop.logo} alt={shop.name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-[#0f4c2b]">{shop.name.charAt(0)}</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#0f4c2b] transition-colors">
                        {shop.name}
                      </h3>
                      {shop.description && (
                        <p className="text-gray-600 mt-1 line-clamp-1">{shop.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#0f4c2b] font-medium">
                      <span className="hidden md:inline">Visiter</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {shop.city && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{shop.city}</span>
                      </div>
                    )}
                    {shop.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{shop.rating}</span>
                      </div>
                    )}
                    {shop.is_active && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Ouvert
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
