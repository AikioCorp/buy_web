import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Package, ShoppingCart, Star, ChevronRight, Truck, Shield, 
  Clock, ArrowRight, Heart, Eye, ChevronLeft, RefreshCw,
  ShoppingBag, Sparkles, UtensilsCrossed, Store,
  Smartphone, Home, Shirt, Dumbbell, Laptop, Zap, Gift, Percent, Tag,
  Headphones, Monitor, Watch, Camera, FolderTree
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { Product } from '../lib/api/productsService'
import { categoriesService } from '../lib/api/categoriesService'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useToast } from '../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

const getImageUrl = (product: Product): string | null => {
  // Backend returns 'images' from product_media, but interface uses 'media'
  const mediaArray = product.media || (product as any).images || []
  if (!mediaArray || mediaArray.length === 0) return null
  const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
  if (url.startsWith('http://')) url = url.replace('http://', 'https://')
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// 8 Catégories principales
const mainCategories = [
  { name: 'Mode', slug: 'mode', icon: Shirt, color: 'bg-pink-500', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop' },
  { name: 'Alimentaire', slug: 'alimentaire', icon: ShoppingBag, color: 'bg-green-500', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop' },
  { name: 'Parfumerie', slug: 'parfumerie', icon: Sparkles, color: 'bg-purple-500', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop' },
  { name: 'Cuisine', slug: 'cuisine', icon: UtensilsCrossed, color: 'bg-orange-500', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop' },
  { name: 'Électronique', slug: 'electronique', icon: Laptop, color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop' },
  { name: 'Téléphones', slug: 'telephones', icon: Smartphone, color: 'bg-cyan-500', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
  { name: 'Sport', slug: 'sport', icon: Dumbbell, color: 'bg-red-500', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
  { name: 'Maison', slug: 'maison', icon: Home, color: 'bg-teal-500', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop' },
]

// Boutiques en vedette
const featuredShops = [
  { id: 9, name: 'Shopreate', slug: 'shopreate', logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop', category: 'Alimentaire', rating: 4.7, color: 'from-green-500 to-emerald-600' },
  { id: 10, name: 'Orca', slug: 'orca', logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop', category: 'Cuisine', rating: 4.5, color: 'from-blue-500 to-cyan-600' },
  { id: 11, name: 'Dicarlo', slug: 'dicarlo', logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop', category: 'Parfumerie', rating: 4.9, color: 'from-purple-500 to-pink-600' },
  { id: 12, name: 'Carré Marché', slug: 'carre-marche', logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop', category: 'Alimentaire', rating: 4.6, color: 'from-orange-500 to-red-600' },
]

// Toutes les boutiques
const allShopsData = [
  ...featuredShops,
  { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali', logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop', category: 'Électronique', rating: 4.8 },
  { id: 2, name: 'Mode Bamako', slug: 'mode-bamako', logo: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop', category: 'Mode', rating: 4.6 },
  { id: 3, name: 'Sport Plus', slug: 'sport-plus', logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop', category: 'Sport', rating: 4.5 },
  { id: 4, name: 'Beauté Plus', slug: 'beaute-plus', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', category: 'Beauté', rating: 4.7 },
  { id: 5, name: 'Maison & Déco', slug: 'maison-deco', logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop', category: 'Maison', rating: 4.4 },
  { id: 6, name: 'Saveurs du Mali', slug: 'saveurs-du-mali', logo: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop', category: 'Alimentaire', rating: 4.9 },
  { id: 7, name: 'Électro Bamako', slug: 'electro-bamako', logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', category: 'Électroménager', rating: 4.6 },
  { id: 8, name: 'Tendance Afrique', slug: 'tendance-afrique', logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&h=200&fit=crop', category: 'Mode', rating: 4.8 },
]


// Bannières Hero
const heroBanners = [
  { title: 'Nouvelle Collection', subtitle: 'Mode Africaine 2025', description: 'Découvrez les dernières tendances', bgColor: 'from-purple-600 to-pink-600', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=400&fit=crop', cta: 'Découvrir', link: '/shops?category=mode' },
  { title: 'Flash Sale', subtitle: 'Jusqu\'à -70%', description: 'Offres limitées sur l\'électronique', bgColor: 'from-red-600 to-orange-500', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop', cta: 'En profiter', link: '/deals' },
  { title: 'Livraison Gratuite', subtitle: 'Sur +50 000 FCFA', description: 'Partout à Bamako', bgColor: 'from-green-600 to-emerald-500', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop', cta: 'Commander', link: '/shops' },
]

// Bannières promotionnelles
const promoBanners = [
  { title: 'Smartphones', subtitle: 'Dernière génération', discount: '-30%', bgColor: 'from-blue-600 to-indigo-700', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=200&fit=crop' },
  { title: 'Électroménager', subtitle: 'Qualité premium', discount: '-25%', bgColor: 'from-orange-500 to-red-600', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop' },
  { title: 'Mode Africaine', subtitle: 'Créations uniques', discount: '-40%', bgColor: 'from-purple-600 to-pink-600', image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=200&fit=crop' },
]

interface DynamicCategory {
  id: number
  name: string
  slug: string
  icon?: string
  image?: string
}

export function HomePage() {
  const { products: apiProducts, refresh: refreshProducts } = useProducts()
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([])
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { showToast } = useToast()
  
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 30 })

  useEffect(() => { 
    refreshProducts()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories()
      if (response.data && Array.isArray(response.data)) {
        setDynamicCategories(response.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const getCategoryImage = (cat: DynamicCategory): string => {
    if (cat.icon) return cat.icon
    if (cat.image) return cat.image
    // Fallback images by slug
    const fallbackImages: Record<string, string> = {
      'mode': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop',
      'alimentaire': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
      'parfumerie': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop',
      'cuisine': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
      'electronique': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop',
      'telephones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      'sport': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop',
      'maison': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop',
    }
    return fallbackImages[cat.slug] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCurrentBanner(prev => (prev + 1) % heroBanners.length), 5000)
    return () => clearInterval(interval)
  }, [])

  const allProducts = apiProducts || []
  const dealProducts = allProducts.slice(0, 6)
  const trendingProducts = allProducts.slice(0, 12)
  const newArrivals = allProducts.slice(8, 16)
  const bestSellers = allProducts.slice(4, 12)

  const formatPrice = (price: string | number) => new Intl.NumberFormat('fr-FR').format(Number(price))

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % heroBanners.length)
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    showToast(`${product.name} ajouté au panier !`, 'success')
  }

  const handleToggleFavorite = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleFavorite(product)
    showToast(added ? 'Ajouté aux favoris !' : 'Retiré des favoris', 'success')
  }

  const handleQuickView = (e: React.MouseEvent, productId: number) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/products/${productId}`)
  }

  const ProductCard = ({ product, index, showDiscount = false }: { product: any, index: number, showDiscount?: boolean }) => (
    <Link 
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {showDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{15 + (index % 5) * 10}%
          </div>
        )}
        {index < 3 && !showDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</div>
        )}
        {(getImageUrl(product) || product.media?.[0]?.image_url) ? (
          <img src={getImageUrl(product) || product.media?.[0]?.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="h-12 w-12" /></div>
        )}
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${hoveredProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button 
            onClick={(e) => handleToggleFavorite(e, product)} 
            className={`w-8 h-8 rounded-full shadow flex items-center justify-center transition-colors ${isFavorite(product.id) ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-500 hover:text-white'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => handleAddToCart(e, product)} 
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => handleQuickView(e, product.id)} 
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.store?.name || product.shop?.name || (typeof product.category === 'string' ? product.category : product.category?.name) || 'BuyMore'}</p>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
          <span className="text-xs text-gray-400 ml-1">(24)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-bold text-sm">{formatPrice(product.base_price)} <span className="text-xs font-normal">FCFA</span></span>
          {showDiscount && <span className="text-gray-400 text-xs line-through">{formatPrice(Number(product.base_price) * 1.3)}</span>}
        </div>
      </div>
    </Link>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section avec Sidebar Catégories */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4">
            {/* Sidebar Catégories - Desktop avec Mega Menu */}
            <div className="hidden lg:block w-64 flex-shrink-0 relative">
              <div className="bg-[#0f4c2b] text-white rounded-t-xl px-4 py-3">
                <h3 className="font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Catégories</h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm">
                {(dynamicCategories.length > 0 ? dynamicCategories.slice(0, 8) : mainCategories).map((cat: any) => {
                  const catImage = dynamicCategories.length > 0 ? getCategoryImage(cat) : cat.image
                  return (
                    <div key={cat.slug || cat.id} className="relative group/cat">
                      <Link to={`/products?category=${cat.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={catImage} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-gray-700 group-hover/cat:text-green-600 font-medium text-sm">{cat.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover/cat:text-green-600 group-hover/cat:translate-x-1 transition-transform" />
                      </Link>
                      {/* Mega Menu au survol */}
                      <div className="absolute left-full top-0 ml-1 w-[500px] bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all z-50">
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                            <div className="w-12 h-12 rounded-xl overflow-hidden">
                              <img src={catImage} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{cat.name}</h4>
                              <p className="text-sm text-gray-500">Découvrez nos produits</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {allProducts.filter((p: any) => p.category?.name === cat.name || p.category?.slug === cat.slug || p.category?.name?.includes(cat.name.split(' ')[0])).slice(0, 4).map((product: any) => (
                              <Link key={product.id} to={`/products/${product.id}`} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                {(getImageUrl(product) || product.media?.[0]?.image_url) ? (
                                  <img src={getImageUrl(product) || product.media?.[0]?.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</h5>
                                  <p className="text-green-600 font-bold text-xs mt-1">{formatPrice(product.base_price)} FCFA</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <Link to={`/products?category=${cat.slug}`} className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-600 rounded-lg font-medium text-sm hover:bg-green-100 transition-colors">
                            Voir tous les produits <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="flex-1">
              <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                {heroBanners.map((banner, index) => (
                  <div key={index} className={`absolute inset-0 transition-all duration-700 ${currentBanner === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className={`h-full bg-gradient-to-r ${banner.bgColor} flex items-center relative`}>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <img src={banner.image} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50" />
                      <div className="container mx-auto px-6 md:px-12 relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm mb-3">{banner.subtitle}</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{banner.title}</h1>
                        <p className="text-white/90 mb-6 text-lg">{banner.description}</p>
                        <Link to={banner.link} className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors">
                          {banner.cta} <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/60 transition-all shadow-lg cursor-pointer"><ChevronLeft className="w-7 h-7" /></button>
                <button onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/60 transition-all shadow-lg cursor-pointer"><ChevronRight className="w-7 h-7" /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroBanners.map((_, index) => (<button key={index} onClick={() => setCurrentBanner(index)} className={`h-2 rounded-full transition-all ${currentBanner === index ? 'bg-white w-8' : 'bg-white/50 w-2'}`} />))}
                </div>
              </div>

              {/* Mini Banners */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {promoBanners.map((banner, index) => (
                  <Link key={index} to="/deals" className={`relative h-24 md:h-28 rounded-xl overflow-hidden bg-gradient-to-r ${banner.bgColor} group`}>
                    <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                    <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                      <div>
                        <p className="text-white/80 text-xs">{banner.subtitle}</p>
                        <h4 className="text-white font-bold text-sm md:text-base">{banner.title}</h4>
                      </div>
                      <span className="text-yellow-300 font-black text-lg">{banner.discount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Produits - Desktop */}
            <div className="hidden xl:block w-56 flex-shrink-0">
              <div className="bg-orange-500 text-white rounded-t-xl px-4 py-3">
                <h3 className="font-bold flex items-center gap-2"><Zap className="w-5 h-5" /> Top Ventes</h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm divide-y divide-gray-100">
                {allProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors">
                    {(getImageUrl(product) || product.media?.[0]?.image_url) ? (
                      <img src={getImageUrl(product) || product.media?.[0]?.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center"><Package className="w-7 h-7 text-gray-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                      <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(product.base_price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-y border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Livraison Rapide', desc: 'Partout à Bamako', color: 'text-green-600' },
              { icon: Shield, title: 'Paiement Sécurisé', desc: '100% protégé', color: 'text-blue-600' },
              { icon: RefreshCw, title: 'Retour Facile', desc: 'Sous 7 jours', color: 'text-orange-600' },
              { icon: Clock, title: 'Support 24/7', desc: 'Assistance rapide', color: 'text-purple-600' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${feature.color}`}><feature.icon className="w-6 h-6" /></div>
                <div><h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4><p className="text-xs text-gray-500">{feature.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories Mobile */}
      <section className="lg:hidden py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Catégories</h2>
            <Link to="/categories" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {mainCategories.map((cat) => {
              const IconComponent = cat.icon
              return (
                <Link key={cat.slug} to={`/categories?cat=${cat.slug}`} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div className={`w-14 h-14 rounded-full ${cat.color} flex items-center justify-center text-white shadow-lg`}><IconComponent className="w-6 h-6" /></div>
                  <span className="text-xs text-gray-700 font-medium text-center">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Boutiques en vedette */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Boutiques en vedette</h2>
            <Link to="/shops" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredShops.map((shop) => (
              <Link key={shop.id} to={`/shops/${shop.slug}`} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${shop.color} p-4 text-white hover:scale-[1.02] transition-transform shadow-lg`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 overflow-hidden">
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold">{shop.name}</h3>
                <p className="text-white/80 text-xs">{shop.category}</p>
                <div className="flex items-center gap-1 mt-2"><Star className="w-3 h-3 fill-yellow-300 text-yellow-300" /><span className="text-xs">{shop.rating}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Toutes les boutiques */}
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Toutes les boutiques</h2>
            <Link to="/shops" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {allShopsData.map((shop) => (
              <Link key={shop.id} to={`/shops/${shop.slug}`} className="flex flex-col items-center gap-2 min-w-[80px] group">
                <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center overflow-hidden group-hover:border-green-400 transition-colors">
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-gray-700 font-medium text-center line-clamp-2 max-w-[80px] group-hover:text-green-600">{shop.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="py-6 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Zap className="w-6 h-6 text-yellow-300" /></div>
              <div><h2 className="text-xl font-bold text-white">Ventes Flash</h2><p className="text-white/80 text-sm">Offres limitées - Dépêchez-vous!</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm">Se termine dans:</span>
              <div className="flex gap-1">
                {[{ value: countdown.hours, label: 'H' }, { value: countdown.minutes, label: 'M' }, { value: countdown.seconds, label: 'S' }].map((item, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 text-center min-w-[50px]">
                    <div className="text-xl font-black text-red-500">{String(item.value).padStart(2, '0')}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {dealProducts.map((product: any, index: number) => (
              <Link key={product.id} to={`/products/${product.id}`} className="group bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{20 + index * 10}%</div>
                  {(getImageUrl(product) || product.media?.[0]?.image_url) ? (
                    <img src={getImageUrl(product) || product.media?.[0]?.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (<div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="h-10 w-10" /></div>)}
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-gray-900 text-xs line-clamp-2 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600 font-bold text-sm">{formatPrice(Number(product.base_price) * 0.8)}</span>
                    <span className="text-gray-400 text-xs line-through">{formatPrice(product.base_price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produits par catégorie avec tabs */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Produits Populaires</h2>
            <div className="flex gap-2 overflow-x-auto">
              {['Tous', 'Électronique', 'Mode', 'Sport', 'Maison'].map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat === 'Tous' ? null : cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat || (cat === 'Tous' && !selectedCategory) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(selectedCategory ? trendingProducts.filter((p: any) => p.category === selectedCategory) : trendingProducts).slice(0, 10).map((product: any, index: number) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors">Voir tous les produits <ArrowRight className="w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      {/* Grande bannière promo */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="relative z-10 h-full flex items-center px-8 md:px-16">
              <div>
                <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full mb-3">OFFRE SPÉCIALE</span>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2">Jusqu'à 50% de réduction</h2>
                <p className="text-white/80 mb-4">Sur une sélection de produits électroniques</p>
                <Link to="/deals" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors">Découvrir <ArrowRight className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><Gift className="w-5 h-5 text-purple-600" /></div>
              <div><h2 className="text-xl font-bold text-gray-900">Nouveautés</h2><p className="text-gray-500 text-sm">Derniers produits ajoutés</p></div>
            </div>
            <Link to="/products?sort=newest" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((product: any, index: number) => (<ProductCard key={product.id} product={product} index={index} />))}
          </div>
        </div>
      </section>

      {/* Meilleures ventes */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Tag className="w-5 h-5 text-orange-600" /></div>
              <div><h2 className="text-xl font-bold text-gray-900">Meilleures Ventes</h2><p className="text-gray-500 text-sm">Les plus populaires</p></div>
            </div>
            <Link to="/products?sort=bestsellers" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((product: any, index: number) => (<ProductCard key={product.id} product={product} index={index} showDiscount />))}
          </div>
        </div>
      </section>

      {/* Features Footer */}
      <section className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Livraison Rapide', desc: 'Partout à Bamako en 24h' },
              { icon: Shield, title: 'Paiement Sécurisé', desc: 'Transactions 100% protégées' },
              { icon: RefreshCw, title: 'Retour Facile', desc: 'Satisfait ou remboursé' },
              { icon: Clock, title: 'Support 24/7', desc: 'Une équipe à votre écoute' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"><feature.icon className="w-6 h-6 text-green-400" /></div>
                <div><h4 className="font-semibold">{feature.title}</h4><p className="text-sm text-gray-400">{feature.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-10 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Inscrivez-vous à notre Newsletter</h2>
            <p className="text-green-100 mb-6">Recevez nos offres exclusives et nouveautés en avant-première</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input type="email" placeholder="Votre adresse email" className="flex-1 px-5 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <button type="submit" className="px-8 py-3 bg-yellow-400 text-green-900 rounded-full font-bold hover:bg-yellow-300 transition-colors">S'inscrire</button>
            </form>
            <p className="text-green-200 text-sm mt-4">🎁 -10% sur votre première commande</p>
          </div>
        </div>
      </section>
    </div>
  )
}
