import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Store, Search, MapPin, Star, ArrowRight, Grid, List, ShoppingBag } from 'lucide-react'
import { shopsService } from '../lib/api/shopsService'

interface Shop {
  id: number
  name: string
  slug: string
  description?: string
  logo_url?: string
  logo?: string
  banner_url?: string
  banner?: string
  city?: string
  category?: string
  is_active: boolean
  rating?: number
  products_count?: number
}

// Boutiques fictives
const mockShops: Shop[] = [
  { id: 9, name: 'Shopreate', slug: 'shopreate', description: 'Supermarché alimentaire moderne. Produits frais, épicerie fine, fruits et légumes de qualité.', logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=300&fit=crop', city: 'Bamako', category: 'Alimentaire', is_active: true, rating: 4.7, products_count: 156 },
  { id: 10, name: 'Orca', slug: 'orca', description: 'Spécialiste cuisine et aménagement intérieur. Ustensiles, électroménager et mobilier.', logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=300&fit=crop', city: 'Bamako', category: 'Cuisine', is_active: true, rating: 4.5, products_count: 89 },
  { id: 11, name: 'Dicarlo', slug: 'dicarlo', description: 'Parfumerie et cosmétiques de luxe. Grandes marques internationales et soins beauté.', logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=300&fit=crop', city: 'Bamako', category: 'Parfumerie', is_active: true, rating: 4.9, products_count: 234 },
  { id: 12, name: 'Carré Marché', slug: 'carre-marche', description: 'Alimentaire et équipement cuisine. Produits locaux et importés de qualité.', logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=300&fit=crop', city: 'Bamako', category: 'Alimentaire', is_active: true, rating: 4.6, products_count: 178 },
  { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali', description: 'Votre destination pour les dernières technologies. Smartphones, tablettes, ordinateurs.', logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop', city: 'Bamako', category: 'Électronique', is_active: true, rating: 4.8, products_count: 312 },
  { id: 2, name: 'Mode Bamako', slug: 'mode-bamako', description: 'Boutique de mode africaine et internationale. Vêtements wax, bazin, et styles modernes.', logo: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=300&fit=crop', city: 'Bamako', category: 'Mode', is_active: true, rating: 4.6, products_count: 267 },
  { id: 3, name: 'Sport Plus', slug: 'sport-plus', description: 'Équipements sportifs de qualité. Chaussures, vêtements de sport, et accessoires.', logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop', city: 'Bamako', category: 'Sport', is_active: true, rating: 4.5, products_count: 145 },
  { id: 4, name: 'Beauté Plus', slug: 'beaute-plus', description: 'Cosmétiques et soins beauté. Maquillage, soins du visage et du corps.', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=300&fit=crop', city: 'Bamako', category: 'Beauté', is_active: true, rating: 4.7, products_count: 198 },
  { id: 5, name: 'Maison & Déco', slug: 'maison-deco', description: 'Décoration intérieure et mobilier. Transformez votre maison en un espace unique.', logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=300&fit=crop', city: 'Bamako', category: 'Maison', is_active: true, rating: 4.4, products_count: 123 },
  { id: 6, name: 'Saveurs du Mali', slug: 'saveurs-du-mali', description: 'Produits alimentaires locaux et traditionnels. Épices, céréales, et spécialités maliennes.', logo: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=300&fit=crop', city: 'Bamako', category: 'Alimentaire', is_active: true, rating: 4.9, products_count: 87 },
  { id: 7, name: 'Électro Bamako', slug: 'electro-bamako', description: 'Électroménager et appareils électroniques. TV, climatiseurs, réfrigérateurs.', logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=300&fit=crop', city: 'Bamako', category: 'Électroménager', is_active: true, rating: 4.6, products_count: 156 },
  { id: 8, name: 'Tendance Afrique', slug: 'tendance-afrique', description: 'Mode africaine contemporaine. Créations uniques et tendances actuelles.', logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&h=200&fit=crop', banner: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=300&fit=crop', city: 'Bamako', category: 'Mode', is_active: true, rating: 4.8, products_count: 189 },
]

export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    loadShops()
  }, [searchParams])

  const loadShops = async () => {
    try {
      setLoading(true)
      const search = searchParams.get('search') || ''
      setSearchQuery(search)
      
      const response = await shopsService.getPublicShops(1, 50)
      if (response.data?.results && response.data.results.length > 0) {
        setShops(response.data.results)
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        setShops(response.data)
      } else {
        // Fallback sur les boutiques fictives
        setShops(mockShops)
      }
    } catch (error) {
      // Fallback sur les boutiques fictives
      setShops(mockShops)
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
