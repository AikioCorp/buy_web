import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSupabase } from '@buymore/api-client'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/Button'
import { Package, Store, ShoppingCart } from 'lucide-react'

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(id, name, slug, city, country),
          category:categories(id, name),
          images:product_images(*)
        `)
        .eq('id', id)
        .single()

      if (data) setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.images?.[0]?.image_url,
        shop_id: product.shop.id,
        shop_name: product.shop.name
      })
      alert('Produit ajouté au panier !')
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Chargement...</div>

  if (!product) return <div className="container mx-auto px-4 py-8">Produit introuvable</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {product.images?.[0]?.image_url ? (
              <img
                src={product.images[0].image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="h-32 w-32" />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(1, 5).map((img: any, idx: number) => (
                <div key={idx} className="aspect-square bg-gray-200 rounded overflow-hidden">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <Link to={`/shops/${product.shop.id}`} className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-4">
            <Store className="h-5 w-5" />
            <span>{product.shop.name}</span>
          </Link>

          <div className="text-3xl font-bold text-primary mb-6">
            {formatPrice(product.price, product.currency)}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{product.description || 'Aucune description disponible'}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Stock disponible : <span className="font-semibold">{product.stock_quantity}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <label className="font-semibold">Quantité :</label>
            <input
              type="number"
              min="1"
              max={product.stock_quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border rounded-md"
            />
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {product.stock_quantity === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </Button>
        </div>
      </div>
    </div>
  )
}
