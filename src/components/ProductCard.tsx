import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useToast } from '@/components/Toast'
import { Product } from '@/lib/api/productsService'

interface ProductCardProps {
  product: Product | any
  showDiscount?: boolean
  dark?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

const getImageUrl = (product: any): string | undefined => {
  const mediaArray = product?.media || product?.images || []
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

const formatPrice = (price: string | number) => {
  return new Intl.NumberFormat('fr-FR').format(Number(price))
}

export function ProductCard({ product, showDiscount = false, dark = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { showToast } = useToast()
  
  const isLiked = isFavorite(product.id)

  const price = parseFloat(product.base_price) || 0
  const originalPrice = price * 1.3 // Simulated original price for discount
  const discount = showDiscount ? Math.round((1 - price / originalPrice) * 100) : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    showToast(`${product.name} ajouté au panier !`, 'success')
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleFavorite(product)
    showToast(added ? 'Ajouté aux favoris !' : 'Retiré des favoris', 'success')
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Navigate to product page using slug (fallback to ID)
    window.location.href = `/products/${product.slug || product.id}`
  }

  return (
    <Link
      to={`/products/${product.slug || product.id}`}
      className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${dark ? 'bg-white/10 backdrop-blur-sm' : 'bg-white'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(product) || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {showDiscount && discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button
            onClick={handleLike}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 rounded-full bg-white text-gray-600 hover:bg-green-500 hover:text-white flex items-center justify-center shadow-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleQuickView}
            className="w-9 h-9 rounded-full bg-white text-gray-600 hover:bg-blue-500 hover:text-white flex items-center justify-center shadow-lg transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#0f4c2b] text-white py-3 font-semibold hover:bg-[#1a5f3a] transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span className={`text-xs uppercase tracking-wide ${dark ? 'text-white/70' : 'text-gray-500'}`}>
            {product.category.name || product.category}
          </span>
        )}
        
        {/* Name */}
        <h3 className={`font-semibold mt-1 line-clamp-2 transition-colors ${dark ? 'text-white group-hover:text-white/80' : 'text-gray-900 group-hover:text-[#0f4c2b]'}`}>
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : dark ? 'text-white/30' : 'text-gray-300'}`} />
          ))}
          <span className={`text-xs ml-1 ${dark ? 'text-white/60' : 'text-gray-500'}`}>(4.0)</span>
        </div>
        
        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-lg font-bold ${dark ? 'text-white' : 'text-[#0f4c2b]'}`}>
            {formatPrice(price)} FCFA
          </span>
          {showDiscount && (
            <span className={`text-sm line-through ${dark ? 'text-white/50' : 'text-gray-400'}`}>
              {formatPrice(originalPrice)} FCFA
            </span>
          )}
        </div>

        {/* Store */}
        {product.store && (
          <p className={`text-xs mt-2 ${dark ? 'text-white/60' : 'text-gray-500'}`}>
            Vendu par <span className={`font-medium ${dark ? 'text-white/80' : 'text-gray-700'}`}>{product.store.name}</span>
          </p>
        )}
      </div>
    </Link>
  )
}
