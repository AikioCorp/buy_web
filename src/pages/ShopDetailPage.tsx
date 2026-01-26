import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { shopsService, Shop } from '@/lib/api/shopsService'
import { productsService, Product } from '@/lib/api/productsService'
import { Card, CardContent } from '@/components/Card'
import { Package, Store, MapPin, Star, ShoppingBag } from 'lucide-react'

// Helper to format price
const formatPrice = (price: number | string, currency: string = 'XOF') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(numPrice)
}

// Helper to get product image
const getProductImage = (product: Product): string | undefined => {
  return product.media?.[0]?.image_url
}

// Helper to get product price
const getProductPrice = (product: Product): number => {
  return parseFloat(product.base_price) || 0
}

export function ShopDetailPage() {
  const { id } = useParams()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadShopData()
    }
  }, [id])

  const loadShopData = async () => {
    try {
      setLoading(true)
      
      // Charger la boutique
      const shopResponse = await shopsService.getShopById(parseInt(id!))
      if (shopResponse.data) {
        setShop(shopResponse.data)
      }
      
      // Charger les produits de la boutique
      const productsResponse = await productsService.getProducts({ 
        store_id: parseInt(id!)
      })
      if (productsResponse.data?.results) {
        setProducts(productsResponse.data.results)
      } else if (Array.isArray(productsResponse.data)) {
        setProducts(productsResponse.data)
      }
    } catch (error) {
      console.error('Error loading shop:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-4 -mt-16">
              <div className="w-32 h-32 bg-gray-300 rounded-xl"></div>
              <div className="space-y-2 pt-20">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
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
          <Link to="/shops" className="text-[#0f4c2b] hover:underline font-medium">
            ← Retour aux boutiques
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="h-64 bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Shop Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 relative z-10 mb-8">
          {/* Logo */}
          <div className="w-32 h-32 bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white flex-shrink-0">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white">
                <Store className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
            {shop.description && (
              <p className="text-gray-600 mb-3 max-w-2xl">{shop.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                shop.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${shop.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {shop.is_active ? 'Boutique active' : 'Boutique inactive'}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {products.length} produit{products.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits de la boutique</h2>
          
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-500">Cette boutique n'a pas encore ajouté de produits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0f4c2b] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xl font-bold text-[#0f4c2b]">
                        {formatPrice(getProductPrice(product))}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
