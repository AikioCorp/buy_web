import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Percent, Clock, ShoppingCart, Zap, Gift, Tag, ArrowRight, Star, Package } from 'lucide-react'
import { productsService, Product } from '../lib/api/productsService'

// Produits fictifs pour les promotions
const mockDealsProducts: any[] = [
  { id: 101, name: 'iPhone 15 Pro Max', base_price: '850000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 102, name: 'AirPods Pro 2', base_price: '175000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 103, name: 'Robe Africaine Wax', base_price: '35000', category: { name: 'Mode' }, media: [{ image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 104, name: 'Nike Air Max 270', base_price: '95000', category: { name: 'Sport' }, media: [{ image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 105, name: 'Apple Watch Series 9', base_price: '350000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 106, name: 'Parfum Dior Sauvage', base_price: '145000', category: { name: 'Parfumerie' }, media: [{ image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 107, name: 'Set Casseroles Inox', base_price: '65000', category: { name: 'Cuisine' }, media: [{ image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 108, name: 'Riz Parfumé Thaï 5kg', base_price: '12500', category: { name: 'Alimentaire' }, media: [{ image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 109, name: 'MacBook Air M3', base_price: '1200000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 110, name: 'Boubou Bazin Riche', base_price: '75000', category: { name: 'Mode' }, media: [{ image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 111, name: 'Samsung Galaxy S24', base_price: '950000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 112, name: 'TV Samsung 55" 4K', base_price: '450000', category: { name: 'Électroménager' }, media: [{ image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 113, name: 'Climatiseur 12000 BTU', base_price: '285000', category: { name: 'Électroménager' }, media: [{ image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 114, name: 'Canapé 3 Places', base_price: '350000', category: { name: 'Maison' }, media: [{ image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 115, name: 'Miel Pays Dogon 1kg', base_price: '15000', category: { name: 'Alimentaire' }, media: [{ image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 121, name: 'Casque Sony WH-1000XM5', base_price: '295000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 122, name: 'iPad Pro 12.9"', base_price: '850000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 123, name: 'Sneakers Adidas', base_price: '75000', category: { name: 'Sport' }, media: [{ image_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 127, name: 'Drone DJI Mini 3', base_price: '450000', category: { name: 'Électronique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop', is_primary: true }] },
  { id: 128, name: 'Console PS5', base_price: '550000', category: { name: 'Gaming' }, media: [{ image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop', is_primary: true }] },
]

// Helper to get price as number
const getPrice = (product: Product): number => {
  return parseFloat(product.base_price) || 0
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

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
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsService.getProducts({ page: 1 })
      if (response.data?.results && response.data.results.length > 0) {
        setProducts(response.data.results)
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        setProducts(response.data)
      } else {
        // Fallback sur les produits fictifs
        setProducts(mockDealsProducts as Product[])
      }
    } catch (error) {
      // Fallback sur les produits fictifs
      setProducts(mockDealsProducts as Product[])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Countdown timer component
  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
      hours: 23,
      minutes: 59,
      seconds: 59
    })

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 }
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
          } else if (prev.hours > 0) {
            return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
          }
          return { hours: 23, minutes: 59, seconds: 59 }
        })
      }, 1000)
      return () => clearInterval(timer)
    }, [])

    return (
      <div className="flex items-center gap-2">
        <div className="bg-white text-[#0f4c2b] px-3 py-2 rounded-lg font-bold text-xl">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <span className="text-white text-2xl font-bold">:</span>
        <div className="bg-white text-[#0f4c2b] px-3 py-2 rounded-lg font-bold text-xl">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <span className="text-white text-2xl font-bold">:</span>
        <div className="bg-white text-[#0f4c2b] px-3 py-2 rounded-lg font-bold text-xl">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>
    )
  }

  const promoCategories = [
    { icon: <Zap className="w-6 h-6" />, title: 'Flash Sale', discount: '-70%', color: 'from-orange-500 to-red-500' },
    { icon: <Gift className="w-6 h-6" />, title: 'Nouveautés', discount: '-30%', color: 'from-purple-500 to-pink-500' },
    { icon: <Tag className="w-6 h-6" />, title: 'Déstockage', discount: '-50%', color: 'from-blue-500 to-cyan-500' },
    { icon: <Percent className="w-6 h-6" />, title: 'Offres Spéciales', discount: '-40%', color: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Countdown */}
      <div className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Offres limitées</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              MEGA <span className="text-yellow-300">PROMOTIONS</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Jusqu'à -70% sur une sélection de produits. Dépêchez-vous !
            </p>
            
            {/* Countdown */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Fin de l'offre dans</span>
              </div>
              <CountdownTimer />
            </div>
          </div>
        </div>
        
        {/* Wave */}
        <div className="h-16 bg-gray-50" style={{ 
          clipPath: 'ellipse(70% 100% at 50% 100%)',
          marginTop: '-1px'
        }}></div>
      </div>

      {/* Promo Categories */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {promoCategories.map((cat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${cat.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  {cat.icon}
                </div>
                <span className="text-2xl font-black">{cat.discount}</span>
              </div>
              <h3 className="font-bold text-lg">{cat.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Deals Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ventes Flash</h2>
              <p className="text-gray-500">Offres à durée limitée</p>
            </div>
          </div>
          <Link 
            to="/products" 
            className="flex items-center gap-2 text-[#0f4c2b] font-medium hover:underline"
          >
            Voir tout <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Percent className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune promotion disponible</h3>
            <p className="text-gray-500">Revenez bientôt pour découvrir nos offres</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map((product, index) => {
              const fakeDiscount = [30, 40, 50, 60, 70][index % 5]
              const originalPrice = getPrice(product) * (100 / (100 - fakeDiscount))
              
              return (
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ShoppingCart className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      -{fakeDiscount}%
                    </div>
                    
                    {/* Timer Badge */}
                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg flex items-center justify-center gap-1">
                      <Clock size={12} />
                      <span>23:59:59</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 text-sm group-hover:text-[#0f4c2b] transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="mt-2">
                      <span className="font-bold text-lg text-red-500">
                        {formatPrice(getPrice(product))}
                      </span>
                      <span className="text-sm text-gray-400 line-through ml-2">
                        {formatPrice(originalPrice)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor(Math.random() * 50 + 10)} vendus
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8d20c]/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Inscrivez-vous pour des offres exclusives
            </h2>
            <p className="text-white/80 mb-6">
              Recevez en avant-première nos meilleures promotions et codes promo
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e8d20c]"
              />
              <button className="px-6 py-3 bg-[#e8d20c] text-[#0f4c2b] font-bold rounded-lg hover:bg-[#d4c00b] transition-colors">
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Deals */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-100 rounded-lg">
            <Tag className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Toutes les promotions</h2>
            <p className="text-gray-500">Découvrez toutes nos offres en cours</p>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => {
              const fakeDiscount = [20, 25, 30, 35, 40, 45, 50][index % 7]
              
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug || product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
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
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      -{fakeDiscount}%
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {product.category && (
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="font-medium text-gray-900 line-clamp-2 mt-1 text-sm group-hover:text-[#0f4c2b] transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-2">
                      <span className="font-bold text-[#0f4c2b]">
                        {formatPrice(getPrice(product))}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
