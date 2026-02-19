import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { shopsService, Shop } from '@/lib/api/shopsService'
import { productsService, Product } from '@/lib/api/productsService'
import { CardContent } from '@/components/Card'
import { Package, Store, Star, ShoppingBag, Heart, ShoppingCart, Eye, ChevronRight, MapPin, ArrowLeft, MessageCircle } from 'lucide-react'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useCartStore } from '@/store/cartStore'
import { useToast } from '@/components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

const formatPrice = (price: number | string, currency: string = 'XOF') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(numPrice)
}

const getProductImage = (product: Product | any): string | undefined => {
  // Backend returns 'images' from product_media, but interface uses 'media'
  const mediaArray = product.media || product.images || []
  if (!mediaArray || mediaArray.length === 0) return undefined
  const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return undefined
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const getProductPrice = (product: Product | any): number => {
  return parseFloat(product.base_price) || 0
}

export function ShopDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState<Shop | any>(null)
  const [products, setProducts] = useState<(Product | any)[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const addItem = useCartStore((state) => state.addItem)
  const { showToast } = useToast()

  useEffect(() => {
    if (id) {
      loadShopData()
    }
  }, [id])

  const loadShopData = async () => {
    try {
      setLoading(true)
      
      // Essayer de charger depuis l'API
      const shopResponse = await shopsService.getShopBySlugOrId(id!)
      
      if (shopResponse.data) {
        setShop(shopResponse.data)
        
        // Charger les produits de la boutique depuis l'API
        try {
          const productsResponse = await productsService.getProducts({ 
            store_id: shopResponse.data.id,
            light: true
          })
          if (productsResponse.data?.results) {
            setProducts(productsResponse.data.results)
          } else if (Array.isArray(productsResponse.data)) {
            setProducts(productsResponse.data)
          } else {
            setProducts([])
          }
        } catch (err) {
          console.error('Error loading products:', err)
          setProducts([])
        }
      } else {
        setShop(null)
        setProducts([])
      }
    } catch (error) {
      console.error('Error loading shop:', error)
      setShop(null)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-48 md:h-64 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-4 -mt-16">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-xl"></div>
              <div className="space-y-2 pt-20">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl aspect-square"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Boutique introuvable</h2>
          <p className="text-gray-500 mb-6">Cette boutique n'existe pas ou a été supprimée.</p>
          <Link to="/shops" className="text-green-600 hover:underline font-medium">
            ← Retour aux boutiques
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 relative"
        style={(shop.banner_url || shop.banner) ? { 
          backgroundImage: `url(${shop.banner_url || shop.banner})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        } : {}}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>
      </div>

      <div className="container mx-auto px-4">
        {/* Shop Header */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 -mt-12 md:-mt-16 relative z-10 mb-6">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white flex-shrink-0">
            {(shop.logo_url || shop.logo) ? (
              <img src={shop.logo_url || shop.logo || ''} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <Store className="h-10 w-10 md:h-12 md:w-12" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 md:pt-16">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{shop.name}</h1>
                {shop.description && (
                  <p className="text-gray-600 mb-3 max-w-2xl text-sm md:text-base">{shop.description}</p>
                )}
              </div>
              {shop.rating && (
                <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-yellow-700">{shop.rating}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                shop.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${shop.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {shop.is_active ? 'Ouvert' : 'Fermé'}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {products.length} produit{products.length > 1 ? 's' : ''}
              </span>
              {shop.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {shop.address}
                </span>
              )}
              <a 
                href="https://wa.me/22370796969" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                +223 70 79 69 69
              </a>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Produits de la boutique</h2>
            <Link to="/shops" className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium">
              Toutes les boutiques <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-500">Cette boutique n'a pas encore ajouté de produits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.slug || product.id}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${
                      hoveredProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const added = toggleFavorite(product);
                          showToast(added ? 'Ajouté aux favoris !' : 'Retiré des favoris', 'success');
                        }}
                        className={`w-8 h-8 rounded-full shadow flex items-center justify-center transition-colors ${
                          isFavorite(product.id) ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(product, 1);
                          showToast(`${product.name} ajouté au panier !`, 'success');
                        }}
                        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/products/${product.slug || product.id}`);
                        }}
                        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-green-600 font-bold">
                      {formatPrice(getProductPrice(product))}
                    </p>
                  </CardContent>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
