import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSupabase } from '@buymore/api-client'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent } from '@/components/Card'
import { Package } from 'lucide-react'

export function ShopDetailPage() {
  const { id } = useParams()
  const [shop, setShop] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadShopData()
    }
  }, [id])

  const loadShopData = async () => {
    try {
      const supabase = getSupabase()
      const [shopRes, productsRes] = await Promise.all([
        supabase.from('shops').select('*').eq('id', id).single(),
        supabase
          .from('products')
          .select('*, images:product_images(*)')
          .eq('shop_id', id)
          .eq('is_active', true)
      ])

      if (shopRes.data) setShop(shopRes.data)
      if (productsRes.data) setProducts(productsRes.data)
    } catch (error) {
      console.error('Error loading shop:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Chargement...</div>

  if (!shop) return <div className="container mx-auto px-4 py-8">Boutique introuvable</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {shop.cover_url && (
          <div className="h-64 rounded-lg overflow-hidden mb-4">
            <img src={shop.cover_url} alt={shop.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-start space-x-4">
          {shop.logo_url && (
            <img src={shop.logo_url} alt={shop.name} className="w-24 h-24 rounded-lg object-cover" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <p className="text-gray-600 mt-2">{shop.description}</p>
            {shop.city && <p className="text-sm text-gray-500 mt-1">{shop.city}, {shop.country}</p>}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Produits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}>
            <Card className="hover:shadow-lg transition">
              <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                {product.images?.[0]?.image_url ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
