import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Percent, Clock, ShoppingCart, Zap, Gift, Tag, ArrowRight } from 'lucide-react'
import { productsService, Product } from '../lib/api/productsService'

// Helper to get price as number
const getPrice = (product: Product): number => {
  return parseFloat(product.base_price) || 0
}

// Helper to get image URL
const getImageUrl = (product: Product): string | undefined => {
  return product.media?.[0]?.image_url
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
