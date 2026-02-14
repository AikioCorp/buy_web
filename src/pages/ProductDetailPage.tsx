import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsService, Product } from '@/lib/api/productsService'
import { SEO } from '@/components/SEO'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { LoginPopup } from '@/components/LoginPopup'
import { Button } from '@/components/Button'
import { Package, Store, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Star, Truck, Shield, RefreshCw, Check, MessageCircle, X, ZoomIn } from 'lucide-react'

// Helper to format price
const formatPrice = (price: number | string, currency: string = 'XOF') => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(numPrice)
}

// Interface pour les avis
interface Review {
  id: number
  user: string
  avatar?: string
  rating: number
  comment: string
  date: string
  helpful: number
}


export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const user = useAuthStore((state) => state.user)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      
      // Utiliser l'ID ou le slug directement (le backend supporte les deux)
      const response = await productsService.getProduct(id!)
      if (response.data) {
        setProduct(response.data)
        // Load similar products based on category
        loadSimilarProducts(response.data)
      } else if (response.error || response.status === 404) {
        // Produit non trouvé - rediriger vers la page produits
        console.warn('Product not found:', id)
        setProduct(null)
      }
    } catch (error) {
      console.error('Error loading product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const loadSimilarProducts = async (currentProduct: Product) => {
    try {
      const categoryId = currentProduct.category?.id || (currentProduct as any).category_id
      if (categoryId) {
        const response = await productsService.getProducts({ 
          category_id: categoryId, 
          page_size: 5,
          light: true,
        })
        if (response.data?.results) {
          // Filter out the current product
          const filtered = response.data.results.filter((p: Product) => p.id !== currentProduct.id)
          setSimilarProducts(filtered.slice(0, 4))
        }
      }
    } catch (error) {
      console.error('Error loading similar products:', error)
    }
  }

  // Get product images from media array (backend returns 'images' from product_media)
  const getImages = () => {
    const mediaArray = product?.media || (product as any)?.images || []
    if (!mediaArray || mediaArray.length === 0) {
      return []
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'
    return mediaArray.map((m: any) => {
      let url = m.image_url || m.file
      if (!url) return null
      // Convertir http:// en https:// pour éviter le blocage mixed content
      if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://')
      }
      if (url.startsWith('https://')) return url
      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    }).filter(Boolean) as string[]
  }

  // Get product price
  const getPrice = () => {
    return parseFloat(product?.base_price || '0')
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      showToast(`${product.name} ajouté au panier !`, 'success')
    }
  }

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity)
      if (!user) {
        setShowLoginPopup(true)
        return
      }
      navigate('/checkout')
    }
  }

  const handleLoginSuccess = () => {
    navigate('/checkout')
  }

  const handleWhatsAppOrder = () => {
    if (product) {
      const productUrl = `${window.location.origin}/products/${product.slug || product.id}`
      const message = `Bonjour BuyMore, je souhaite commander:\n\n*Produit:* ${product.name}\n*Quantité:* ${quantity}\n*Prix unitaire:* ${formatPrice(getPrice())} FCFA\n*Montant total:* ${formatPrice(getPrice() * quantity)} FCFA\n\n*Lien du produit:* ${productUrl}\n\n*Lieu de livraison:* [Veuillez préciser votre adresse]\n\nMerci de me confirmer la disponibilité et les frais de livraison.`
      const whatsappUrl = `https://wa.me/22370796969?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Découvrez ${product?.name} sur BuyMore`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Lien copié dans le presse-papier !', 'info')
    }
  }

  const handleLike = () => {
    if (product) {
      const added = toggleFavorite(product)
      showToast(added ? 'Ajouté aux favoris !' : 'Retiré des favoris', 'success')
    }
  }

  const handleSubmitReview = () => {
    if (!user) {
      setShowLoginPopup(true)
      return
    }
    if (!newReview.comment.trim()) {
      showToast('Veuillez écrire un commentaire', 'error')
      return
    }
    const review: Review = {
      id: Date.now(),
      user: user.first_name ? `${user.first_name} ${user.last_name?.charAt(0) || ''}.` : user.email.split('@')[0],
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    }
    setReviews([review, ...reviews])
    setNewReview({ rating: 5, comment: '' })
    setShowReviewForm(false)
    showToast('Merci pour votre avis !', 'success')
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }))

  const images = getImages()
  const currentImage = images[selectedImageIndex] || null
  const isLiked = product ? isFavorite(product.id) : false

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!showImageModal) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImageModal(false)
      } else if (e.key === 'ArrowLeft') {
        setModalImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
      } else if (e.key === 'ArrowRight') {
        setModalImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, images.length])

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

  // Get first image URL for SEO
  const getFirstImageUrl = () => {
    const mediaArray = product?.media || (product as any)?.images || []
    if (!mediaArray || mediaArray.length === 0) return null
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'
    const firstMedia = mediaArray[0]
    let url = firstMedia?.image_url || firstMedia?.file
    if (!url) return null
    if (url.startsWith('http://')) url = url.replace('http://', 'https://')
    if (url.startsWith('https://')) return url
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Component */}
      <SEO
        title={product?.meta_title || product.name}
        description={product?.meta_description || product.description?.slice(0, 160) || `Achetez ${product.name} sur BuyMore Mali`}
        image={getFirstImageUrl() || undefined}
        url={`${window.location.origin}/products/${product.slug || product.id}`}
        type="product"
        product={{
          name: product.name,
          price: parseFloat(product.base_price),
          currency: 'XOF',
          availability: (product.stock ?? 0) > 0 || product.track_inventory === false ? 'in_stock' : 'out_of_stock',
          category: product.category?.name,
          brand: product.store?.name || product.shop?.name,
          rating: product.average_rating,
          reviewCount: product.total_reviews
        }}
      />

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
            {/* Main Image - Square Format with Premium Design */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-2xl relative group cursor-zoom-in" onClick={() => { if (currentImage) { setModalImageIndex(selectedImageIndex); setShowImageModal(true); } }}>
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
                    <Package className="h-32 w-32 opacity-30" />
                  </div>
                )}
                
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Zoom indicator - Enhanced */}
                {currentImage && (
                  <div className="absolute top-6 right-6 bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm transform group-hover:scale-110">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                )}
                
                {/* Navigation arrows - Enhanced */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gray-200"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gray-200"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Badges - Enhanced */}
                <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                  {(product as any).compare_at_price && parseFloat((product as any).compare_at_price) > getPrice() && (
                    <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                      -{Math.round((1 - getPrice() / parseFloat((product as any).compare_at_price)) * 100)}% OFF
                    </span>
                  )}
                  {(product.stock ?? 0) > 0 && (
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      En stock
                    </span>
                  )}
                </div>

              </div>
            </div>
            
            {/* Thumbnails - Single horizontal line */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 bg-white rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-[#0f4c2b] shadow-lg ring-2 ring-[#0f4c2b]/20 scale-110' : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Category badge */}
            {product.category && (
              <span className="inline-block px-3 py-1 bg-[#0f4c2b]/10 text-[#0f4c2b] text-sm font-medium rounded-full">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>
            
            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({reviews.length} avis)</span>
              </div>
            )}

            {/* Store link */}
            {product.store && (
              <Link 
                to={`/shops/${product.store.slug || product.store.id}`} 
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Store className="h-4 w-4" />
                <span className="font-medium text-sm">{product.store.name}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-gray-200">
              <span className="text-3xl font-black text-[#0f4c2b]">
                {formatPrice(getPrice())}
              </span>
              {(product as any).compare_at_price && parseFloat((product as any).compare_at_price) > getPrice() && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(parseFloat((product as any).compare_at_price))}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded">
                    -{Math.round((1 - getPrice() / parseFloat((product as any).compare_at_price)) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </div>

            {/* Product Characteristics/Features */}
            {(product as any).features && (product as any).features.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3">Caractéristiques</h3>
                <div className="space-y-2">
                  {(product as any).features.map((feature: any) => (
                    <div key={feature.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                      <span className="text-sm text-gray-900 font-semibold">{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Features/Characteristics */}
            <div className="grid grid-cols-2 gap-3">
              {(product as any).delivery_time && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Livraison rapide</p>
                    <p className="text-xs text-gray-500">Sous {(product as any).delivery_time}</p>
                  </div>
                </div>
              )}
              {(product as any).warranty_duration && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Garantie</p>
                    <p className="text-xs text-gray-500">{(product as any).warranty_duration}</p>
                  </div>
                </div>
              )}
              {(product as any).return_policy && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Retour facile</p>
                    <p className="text-xs text-gray-500">Sous {(product as any).return_policy}</p>
                  </div>
                </div>
              )}
              {(product as any).is_authentic && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Authentique</p>
                    <p className="text-xs text-gray-500">100% original</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Variants */}
            {(product as any).variants && (product as any).variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Variantes disponibles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(product as any).variants.map((variant: any) => {
                    const optionValues = variant.option_values || {}
                    const variantName = Object.entries(optionValues).map(([key, value]) => `${key}: ${value}`).join(', ')
                    const basePrice = parseFloat(product.base_price || '0')
                    const priceModifier = parseFloat(variant.price_modifier || '0')
                    const finalPrice = basePrice + priceModifier
                    
                    return (
                      <div
                        key={variant.id}
                        className="border-2 border-gray-200 rounded-xl p-3 hover:border-[#0f4c2b] transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Variant Image */}
                          {variant.image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img 
                                src={variant.image_url} 
                                alt={variantName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Variant Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {variantName || variant.sku || 'Variante'}
                            </p>
                            
                            {/* Price */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[#0f4c2b] font-bold text-sm">
                                {formatPrice(finalPrice)}
                              </span>
                              {priceModifier !== 0 && (
                                <span className={`text-xs ${priceModifier > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  {priceModifier > 0 ? '+' : ''}{formatPrice(priceModifier)}
                                </span>
                              )}
                            </div>
                            
                            {/* Stock */}
                            <div className="flex items-center gap-2 mt-1">
                              {variant.stock > 0 ? (
                                <span className="text-xs text-green-600 font-medium">
                                  ✓ En stock ({variant.stock} unités)
                                </span>
                              ) : (
                                <span className="text-xs text-red-600 font-medium">
                                  ✗ Rupture de stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Product Options */}
            {(product as any).options && (product as any).options.length > 0 && (
              <div className="space-y-3">
                {(product as any).options.map((option: any) => (
                  <div key={option.id}>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{option.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values && option.values.map((value: string, idx: number) => (
                        <button
                          key={idx}
                          className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm hover:border-[#0f4c2b] transition-colors"
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock info */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(product.stock ?? 0) > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {(product.stock ?? 0) > 0 ? 'En stock' : 'Rupture de stock'}
              </span>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 text-sm">Quantité :</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-2 text-center border-0 focus:outline-none focus:ring-0 font-semibold"
                />
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={(product.stock ?? 0) <= 0}
                  className="flex-1 bg-[#0f4c2b] hover:bg-[#1a5f3a] text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={(product.stock ?? 0) <= 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                  size="lg"
                >
                  Commander
                </Button>
              </div>
              
              <button
                onClick={handleWhatsAppOrder}
                disabled={(product.stock ?? 0) <= 0}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50"
              >
                <MessageCircle className="h-5 w-5" />
                Commander sur WhatsApp
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                    isLiked 
                      ? 'border-red-500 bg-red-50 text-red-500' 
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{isLiked ? 'Favori' : 'Ajouter aux favoris'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-all"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Partager</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Avis et Commentaires */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
              <p className="text-gray-500">{reviews.length} avis sur ce produit</p>
            </div>
            <button
              onClick={() => user ? setShowReviewForm(!showReviewForm) : setShowLoginPopup(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f4c2b] text-white rounded-full font-semibold hover:bg-[#1a5f3a] transition-colors"
            >
              <Star className="w-5 h-5" />
              Donner mon avis
            </button>
          </div>

          {/* Résumé des notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-100">
            {/* Note moyenne */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
                <div className="flex flex-col">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{reviews.length} avis</span>
                </div>
              </div>
            </div>

            {/* Distribution des notes */}
            <div className="col-span-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-600 w-12">{star} étoile{star > 1 ? 's' : ''}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire d'avis */}
          {showReviewForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Partagez votre expérience</h3>
              
              {/* Sélection des étoiles */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Partagez votre expérience avec ce produit..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4c2b]/20 focus:border-[#0f4c2b] resize-none"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-2 bg-[#0f4c2b] text-white rounded-full font-medium hover:bg-[#1a5f3a] transition-colors"
                >
                  Publier mon avis
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des avis */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0f4c2b] to-[#1a5f3a] flex items-center justify-center text-white font-semibold">
                        {review.user.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{review.user}</h4>
                      <span className="text-sm text-gray-400">
                        {new Date(review.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Étoiles */}
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>

                    {/* Commentaire */}
                    <p className="text-gray-600 mb-3">{review.comment}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <button className="text-sm text-gray-500 hover:text-[#0f4c2b] flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Utile ({review.helpful})
                      </button>
                      <button className="text-sm text-gray-500 hover:text-red-500">
                        Signaler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Voir plus d'avis */}
          {reviews.length > 4 && (
            <div className="text-center mt-6">
              <button className="text-[#0f4c2b] font-medium hover:underline">
                Voir tous les avis ({reviews.length})
              </button>
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((relProduct) => {
                const productImages = relProduct.media || (relProduct as any).images || []
                const imageUrl = productImages[0]?.image_url || productImages[0]?.file
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'
                const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`) : null
                
                return (
                  <Link
                    key={relProduct.id}
                    to={`/products/${relProduct.slug || relProduct.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {fullImageUrl ? (
                        <img 
                          src={fullImageUrl} 
                          alt={relProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors">{relProduct.name}</h3>
                      <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(relProduct.base_price)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200" 
          onClick={() => setShowImageModal(false)}
        >
          {/* Close button with tooltip */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-red-400 p-3 bg-red-500/80 hover:bg-red-600 rounded-full backdrop-blur-sm transition-all z-[60] shadow-lg"
            title="Fermer (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation arrows with keyboard hints */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-[60] shadow-lg"
                title="Précédent (←)"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-[60] shadow-lg"
                title="Suivant (→)"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image counter with product name */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/70 px-6 py-2 rounded-full backdrop-blur-sm shadow-lg z-[60] pointer-events-none">
            <div className="text-center">
              <div className="text-sm font-medium">{product?.name}</div>
              <div className="text-xs text-gray-300 mt-0.5">{modalImageIndex + 1} / {images.length}</div>
            </div>
          </div>

          {/* Main image with loading state */}
          <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <div className="relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <img
                src={images[modalImageIndex]}
                alt={product?.name}
                className="max-w-full max-h-full object-contain transition-opacity duration-300"
                onLoadStart={() => setImageLoading(true)}
                onLoad={() => setImageLoading(false)}
                style={{ opacity: imageLoading ? 0.5 : 1 }}
              />
            </div>
          </div>

          {/* Thumbnails with smooth scrolling */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex(idx);
                  }}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    modalImageIndex === idx 
                      ? 'border-white scale-110 shadow-lg shadow-white/50' 
                      : 'border-white/30 hover:border-white/60 hover:scale-105'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Help text */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center">
            Utilisez les flèches ← → pour naviguer • Esc pour fermer
          </div>
        </div>
      )}

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onSuccess={handleLoginSuccess}
        message="Connectez-vous pour finaliser votre commande"
      />
    </div>
  )
}
