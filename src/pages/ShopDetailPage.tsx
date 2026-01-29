import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { shopsService, Shop } from '@/lib/api/shopsService'
import { productsService, Product } from '@/lib/api/productsService'
import { CardContent } from '@/components/Card'
import { Package, Store, Star, ShoppingBag, Heart, ShoppingCart, Eye, ChevronRight, MapPin, Phone } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'

// Boutiques fictives (fallback)
const mockShopsData: Record<string, any> = {
  'shopreate': {
    id: 9,
    name: 'Shopreate',
    slug: 'shopreate',
    description: 'Supermarché alimentaire moderne. Produits frais, épicerie fine, fruits et légumes de qualité à Bamako.',
    logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=300&fit=crop',
    is_active: true,
    address: 'ACI 2000, Bamako',
    phone: '+223 70 00 00 01',
    rating: 4.7,
  },
  'orca': {
    id: 10,
    name: 'Orca',
    slug: 'orca',
    description: 'Spécialiste cuisine et aménagement intérieur. Ustensiles, électroménager et mobilier de cuisine moderne.',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=300&fit=crop',
    is_active: true,
    address: 'Hippodrome, Bamako',
    phone: '+223 70 00 00 02',
    rating: 4.5,
  },
  'dicarlo': {
    id: 11,
    name: 'Dicarlo',
    slug: 'dicarlo',
    description: 'Parfumerie et cosmétiques de luxe. Grandes marques internationales et soins beauté premium.',
    logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=300&fit=crop',
    is_active: true,
    address: 'Hamdallaye ACI, Bamako',
    phone: '+223 70 00 00 03',
    rating: 4.9,
  },
  'carre-marche': {
    id: 12,
    name: 'Carré Marché',
    slug: 'carre-marche',
    description: 'Alimentaire et équipement cuisine. Produits locaux et importés, ustensiles et accessoires culinaires.',
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=300&fit=crop',
    is_active: true,
    address: 'Badalabougou, Bamako',
    phone: '+223 70 00 00 04',
    rating: 4.6,
  },
  'tech-store-mali': {
    id: 1,
    name: 'Tech Store Mali',
    slug: 'tech-store-mali',
    description: 'Votre destination pour les dernières technologies. Smartphones, tablettes, ordinateurs et accessoires.',
    logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop',
    is_active: true,
    address: 'ACI 2000, Bamako',
    phone: '+223 70 00 00 05',
    rating: 4.8,
  },
  'mode-bamako': {
    id: 2,
    name: 'Mode Bamako',
    slug: 'mode-bamako',
    description: 'Boutique de mode africaine et internationale. Vêtements wax, bazin, et styles modernes.',
    logo: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=300&fit=crop',
    is_active: true,
    address: 'Hamdallaye ACI, Bamako',
    phone: '+223 70 00 00 06',
    rating: 4.6,
  },
  'sport-plus': {
    id: 3,
    name: 'Sport Plus',
    slug: 'sport-plus',
    description: 'Équipements sportifs de qualité. Chaussures, vêtements de sport, et accessoires.',
    logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop',
    is_active: true,
    address: 'Badalabougou, Bamako',
    phone: '+223 70 00 00 07',
    rating: 4.5,
  },
}

// Produits fictifs par boutique
const mockProductsByShop: Record<string, any[]> = {
  'shopreate': [
    { id: 108, name: 'Riz Parfumé Thaï 5kg', base_price: '12500', media: [{ image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 134, name: 'Huile d\'Olive Extra Vierge 1L', base_price: '9500', media: [{ image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 135, name: 'Pack Fruits Frais Assortis', base_price: '7500', media: [{ image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 136, name: 'Lait en Poudre Nido 900g', base_price: '8500', media: [{ image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop', is_primary: true }] },
  ],
  'orca': [
    { id: 107, name: 'Set de Casseroles Inox 5 Pièces', base_price: '65000', media: [{ image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 137, name: 'Robot Cuisine Multifonction', base_price: '125000', media: [{ image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 138, name: 'Table de Cuisine Extensible', base_price: '185000', media: [{ image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 139, name: 'Mixeur Plongeant Pro', base_price: '35000', media: [{ image_url: 'https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=400&h=400&fit=crop', is_primary: true }] },
  ],
  'dicarlo': [
    { id: 106, name: 'Parfum Homme Dior Sauvage', base_price: '145000', media: [{ image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 140, name: 'Coffret Soin Visage Premium', base_price: '85000', media: [{ image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 141, name: 'Palette Maquillage Urban Decay', base_price: '55000', media: [{ image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 142, name: 'Parfum Femme Chanel N°5', base_price: '185000', media: [{ image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=400&fit=crop', is_primary: true }] },
  ],
  'carre-marche': [
    { id: 143, name: 'Épices du Mali Coffret', base_price: '15000', media: [{ image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 144, name: 'Couscous Fin Qualité Premium 2kg', base_price: '5500', media: [{ image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 145, name: 'Mixeur Plongeant Professionnel', base_price: '35000', media: [{ image_url: 'https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 146, name: 'Thé Vert Bio 250g', base_price: '4500', media: [{ image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop', is_primary: true }] },
  ],
  'tech-store-mali': [
    { id: 101, name: 'iPhone 15 Pro Max', base_price: '850000', media: [{ image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 102, name: 'AirPods Pro 2ème génération', base_price: '175000', media: [{ image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 105, name: 'Apple Watch Series 9', base_price: '350000', media: [{ image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 109, name: 'MacBook Air M3', base_price: '1200000', media: [{ image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', is_primary: true }] },
  ],
  'mode-bamako': [
    { id: 103, name: 'Robe Africaine Wax Premium', base_price: '35000', media: [{ image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 110, name: 'Boubou Homme Bazin Riche', base_price: '75000', media: [{ image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 147, name: 'Chemise Homme Bogolan', base_price: '28000', media: [{ image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 148, name: 'Ensemble Pagne Femme', base_price: '45000', media: [{ image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop', is_primary: true }] },
  ],
  'sport-plus': [
    { id: 104, name: 'Nike Air Max 270', base_price: '95000', media: [{ image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 149, name: 'Ballon de Football Adidas Pro', base_price: '35000', media: [{ image_url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 150, name: 'Maillot de Football PSG 2024', base_price: '55000', media: [{ image_url: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=400&h=400&fit=crop', is_primary: true }] },
    { id: 151, name: 'Tapis de Yoga Premium', base_price: '25000', media: [{ image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', is_primary: true }] },
  ],
}

const formatPrice = (price: number | string, currency: string = 'XOF') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(numPrice)
}

const getProductImage = (product: Product | any): string | undefined => {
  if (!product.media || product.media.length === 0) return undefined
  const primaryImage = product.media.find((m: any) => m.is_primary) || product.media[0]
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
  const [shop, setShop] = useState<Shop | any>(null)
  const [products, setProducts] = useState<(Product | any)[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

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
            store_id: shopResponse.data.id
          })
          if (productsResponse.data?.results && productsResponse.data.results.length > 0) {
            setProducts(productsResponse.data.results)
          } else if (Array.isArray(productsResponse.data) && productsResponse.data.length > 0) {
            setProducts(productsResponse.data)
          } else {
            // Fallback sur les produits fictifs
            const mockProducts = mockProductsByShop[shopResponse.data.slug || id!] || []
            setProducts(mockProducts)
          }
        } catch {
          // Fallback sur les produits fictifs
          const mockProducts = mockProductsByShop[shopResponse.data.slug || id!] || []
          setProducts(mockProducts)
        }
      } else {
        // Fallback sur les données fictives
        const mockShop = mockShopsData[id!]
        if (mockShop) {
          setShop(mockShop)
          setProducts(mockProductsByShop[id!] || [])
        }
      }
    } catch (error) {
      console.error('Error loading shop:', error)
      // Fallback sur les données fictives
      const mockShop = mockShopsData[id!]
      if (mockShop) {
        setShop(mockShop)
        setProducts(mockProductsByShop[id!] || [])
      }
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
        style={shop.banner ? { 
          backgroundImage: `url(${shop.banner})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        } : {}}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Shop Header */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 -mt-12 md:-mt-16 relative z-10 mb-6">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white flex-shrink-0">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
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
              {shop.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {shop.phone}
                </span>
              )}
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
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
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
                      <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
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
