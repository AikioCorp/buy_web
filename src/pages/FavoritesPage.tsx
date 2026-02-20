import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useCartStore } from '@/store/cartStore'
import { useToast } from '@/components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

const getImageUrl = (product: any): string | null => {
  if (!product) return null
  
  let url: string | null = null
  
  // 1. Essayer product.media
  if (product.media && product.media.length > 0) {
    const primaryImage = product.media.find((m: any) => m.is_primary) || product.media[0]
    url = primaryImage?.image_url || primaryImage?.file
  }
  // 2. Essayer product.product_media
  else if (product.product_media && product.product_media.length > 0) {
    const primaryImage = product.product_media.find((m: any) => m.is_primary) || product.product_media[0]
    url = primaryImage?.image_url || primaryImage?.file
  }
  // 3. Essayer product.images
  else if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find((img: any) => img.is_primary) || product.images[0]
    url = primaryImage?.image || primaryImage?.url || primaryImage?.image_url
  }
  // 4. Propriétés directes
  else if (product.image_url) {
    url = product.image_url
  } else if (product.image) {
    url = product.image
  } else if (product.thumbnail) {
    url = product.thumbnail
  }
  
  if (!url) return null
  
  // Convertir http en https
  if (url.startsWith('http://')) url = url.replace('http://', 'https://')
  
  // Retourner l'URL complète
  if (url.startsWith('https://') || url.startsWith('data:')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const formatPrice = (price: string | number) => new Intl.NumberFormat('fr-FR').format(Number(price))

export function FavoritesPage() {
  const { favorites, removeFavorite, clearFavorites } = useFavoritesStore()
  const addItem = useCartStore((state) => state.addItem)
  const { showToast } = useToast()

  const handleAddToCart = (product: any) => {
    addItem(product, 1)
    showToast(`${product.name} ajouté au panier !`, 'success')
  }

  const handleRemoveFavorite = (productId: number, productName: string) => {
    removeFavorite(productId)
    showToast(`${productName} retiré des favoris`, 'success')
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre liste de favoris est vide</h2>
            <p className="text-gray-600 mb-8">
              Explorez nos produits et ajoutez vos coups de cœur à votre liste de favoris !
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f4c2b] text-white rounded-full font-semibold hover:bg-[#1a5f3a] transition-colors"
            >
              Découvrir les produits
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              <span className="text-sm font-medium">Mes favoris</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Mes <span className="text-[#e8d20c]">Favoris</span>
            </h1>
            <p className="text-lg text-white/80">
              {favorites.length} produit{favorites.length > 1 ? 's' : ''} dans votre liste
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{favorites.length}</span> produit{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
          </p>
          <button
            onClick={() => {
              clearFavorites()
              showToast('Tous les favoris ont été supprimés', 'success')
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Tout supprimer
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <Link to={`/products/${product.slug || product.id}`} className="block relative aspect-square overflow-hidden">
                {getImageUrl(product) ? (
                  <img 
                    src={getImageUrl(product)!} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveFavorite(product.id, product.name)
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link to={`/products/${product.slug || product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-[#0f4c2b] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-500 mb-3">
                  {product.store?.name || 'BuyMore'}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#0f4c2b]">
                      {formatPrice(product.base_price)} 
                    </span>
                    <span className="text-sm text-gray-500 ml-1">FCFA</span>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f4c2b] text-white rounded-full text-sm font-medium hover:bg-[#1a5f3a] transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0f4c2b] text-[#0f4c2b] rounded-full font-semibold hover:bg-[#0f4c2b] hover:text-white transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}
