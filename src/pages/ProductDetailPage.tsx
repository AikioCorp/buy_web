import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsService, Product } from '@/lib/api/productsService'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/Button'
import { Package, Store, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Star } from 'lucide-react'

// Helper to format price
const formatPrice = (price: number | string, currency: string = 'XOF') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(numPrice)
}

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productsService.getProduct(parseInt(id!))
      if (response.data) {
        setProduct(response.data)
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get product images from media array
  const getImages = () => {
    if (!product?.media || product.media.length === 0) {
      return []
    }
    return product.media.map(m => m.image_url).filter(Boolean)
  }

  // Get product price
  const getPrice = () => {
    return parseFloat(product?.base_price || '0')
  }

  const handleAddToCart = () => {
    if (product) {
      const images = getImages()
      addItem({
        product_id: product.id,
        name: product.name,
        price: getPrice(),
        quantity,
        image_url: images[0] || '',
        shop_id: product.store?.id || 0,
        shop_name: product.store?.name || 'Boutique'
      })
      alert('Produit ajouté au panier !')
    }
  }

  const images = getImages()
  const currentImage = images[selectedImageIndex] || null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>)}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Produit introuvable</h2>
          <p className="text-gray-500 mb-6">Ce produit n'existe pas ou a été supprimé.</p>
          <Link to="/products" className="text-[#0f4c2b] hover:underline font-medium">
            ← Retour aux produits
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#0f4c2b]">Accueil</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-[#0f4c2b]">Produits</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg relative group">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                  <Package className="h-32 w-32" />
                </div>
              )}
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#0f4c2b] shadow-md' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category badge */}
            {product.category && (
              <span className="inline-block px-3 py-1 bg-[#0f4c2b]/10 text-[#0f4c2b] text-sm font-medium rounded-full">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>
            
            {/* Store link */}
            {product.store && (
              <Link 
                to={`/shops/${product.store.id}`} 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0f4c2b] transition-colors"
              >
                <Store className="h-5 w-5" />
                <span className="font-medium">{product.store.name}</span>
              </Link>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-[#0f4c2b]">
                {formatPrice(getPrice())}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </div>

            {/* Stock info */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {product.is_active ? 'En stock' : 'Rupture de stock'}
              </span>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Quantité :</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-2 text-center border-0 focus:outline-none focus:ring-0"
                />
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.is_active}
                className="flex-1 bg-[#0f4c2b] hover:bg-[#1a5f3a] text-white py-4 rounded-xl font-semibold transition-colors"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {!product.is_active ? 'Rupture de stock' : 'Ajouter au panier'}
              </Button>
              <button className="p-4 border border-gray-300 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
                <Heart className="h-6 w-6" />
              </button>
              <button className="p-4 border border-gray-300 rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors">
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
