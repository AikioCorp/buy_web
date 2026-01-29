import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsService, Product } from '@/lib/api/productsService'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { LoginPopup } from '@/components/LoginPopup'
import { Button } from '@/components/Button'
import { Package, Store, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Star, Truck, Shield, RefreshCw, Check, MessageCircle } from 'lucide-react'

// Produits fictifs (fallback) avec plusieurs images
const mockProductsData: Record<number, any> = {
  101: { id: 101, name: 'iPhone 15 Pro Max', description: 'Le dernier iPhone avec puce A17 Pro, écran Super Retina XDR 6.7 pouces, système de caméra pro avec zoom optique 5x. Design en titane, bouton Action personnalisable, USB-C avec USB 3.', base_price: '850000', stock: 15, category: { name: 'Électronique' }, store: { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop' },
    { image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop' },
    { image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop' },
  ]},
  102: { id: 102, name: 'AirPods Pro 2ème génération', description: 'Écouteurs sans fil avec réduction active du bruit, mode Transparence adaptatif, Audio spatial personnalisé. Boîtier de charge MagSafe avec haut-parleur intégré.', base_price: '175000', stock: 25, category: { name: 'Électronique' }, store: { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=800&fit=crop' },
  ]},
  103: { id: 103, name: 'Robe Africaine Wax Premium', description: 'Magnifique robe en tissu wax authentique, coupe moderne et élégante. Fabrication artisanale malienne. Disponible en plusieurs tailles.', base_price: '35000', stock: 10, category: { name: 'Mode' }, store: { id: 2, name: 'Mode Bamako', slug: 'mode-bamako' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop' },
  ]},
  104: { id: 104, name: 'Nike Air Max 270', description: 'Chaussures de sport légères et confortables avec amorti Air Max. Idéales pour la course et le style urbain. Semelle extérieure en caoutchouc durable.', base_price: '95000', stock: 20, category: { name: 'Sport' }, store: { id: 3, name: 'Sport Plus', slug: 'sport-plus' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop' },
    { image_url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop' },
  ]},
  105: { id: 105, name: 'Apple Watch Series 9', description: 'Montre connectée avec écran Retina toujours actif, suivi de santé avancé, GPS + Cellular. Puce S9 SiP ultra-performante.', base_price: '350000', stock: 12, category: { name: 'Électronique' }, store: { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop' },
  ]},
  106: { id: 106, name: 'Parfum Homme Dior Sauvage', description: 'Eau de parfum intense et magnétique. Notes de bergamote de Calabre, poivre de Sichuan et bois de santal. 100ml. Flacon élégant.', base_price: '145000', stock: 8, category: { name: 'Parfumerie' }, store: { id: 11, name: 'Dicarlo', slug: 'dicarlo' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=800&fit=crop' },
  ]},
  107: { id: 107, name: 'Set de Casseroles Inox 5 Pièces', description: 'Ensemble de casseroles en acier inoxydable 18/10. Compatible tous feux dont induction, poignées ergonomiques anti-chaleur.', base_price: '65000', stock: 15, category: { name: 'Cuisine' }, store: { id: 10, name: 'Orca', slug: 'orca' }, media: [{ image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop', is_primary: true }] },
  108: { id: 108, name: 'Riz Parfumé Thaï 5kg', description: 'Riz jasmin premium importé de Thaïlande. Grains longs, parfum délicat. Idéal pour accompagner vos plats.', base_price: '12500', stock: 50, category: { name: 'Alimentaire' }, store: { id: 9, name: 'Shopreate', slug: 'shopreate' }, media: [{ image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', is_primary: true }] },
  109: { id: 109, name: 'MacBook Air M3', description: 'Ordinateur portable ultra-fin avec puce M3, écran Liquid Retina 13.6", jusqu\'à 18h d\'autonomie. 8Go RAM, 256Go SSD.', base_price: '1200000', stock: 5, category: { name: 'Électronique' }, store: { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop' },
  ]},
  110: { id: 110, name: 'Boubou Homme Bazin Riche', description: 'Boubou traditionnel en bazin riche de qualité supérieure. Broderie fine fait main. Tenue complète avec pantalon.', base_price: '75000', stock: 8, category: { name: 'Mode' }, store: { id: 2, name: 'Mode Bamako', slug: 'mode-bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop', is_primary: true }] },
  111: { id: 111, name: 'Samsung Galaxy S24 Ultra', description: 'Smartphone premium avec S Pen intégré, écran Dynamic AMOLED 6.8", caméra 200MP. Intelligence artificielle Galaxy AI.', base_price: '950000', stock: 10, category: { name: 'Électronique' }, store: { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali' }, media: [
    { image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop', is_primary: true },
    { image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop' },
  ]},
  112: { id: 112, name: 'Télévision Samsung 55" 4K', description: 'Smart TV Samsung Crystal UHD 55 pouces. Résolution 4K, HDR10+, Tizen OS. Processeur Crystal 4K.', base_price: '450000', stock: 6, category: { name: 'Électroménager' }, store: { id: 7, name: 'Électro Bamako', slug: 'electro-bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop', is_primary: true }] },
  113: { id: 113, name: 'Climatiseur Split 12000 BTU', description: 'Climatiseur inverter économique. Refroidissement rapide, silencieux. Classe énergétique A++.', base_price: '285000', stock: 8, category: { name: 'Électroménager' }, store: { id: 7, name: 'Électro Bamako', slug: 'electro-bamako' }, media: [{ image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&h=800&fit=crop', is_primary: true }] },
  114: { id: 114, name: 'Canapé 3 Places Moderne', description: 'Canapé confortable en tissu de qualité. Design moderne, couleur gris anthracite. Structure en bois massif.', base_price: '350000', stock: 4, category: { name: 'Maison' }, store: { id: 5, name: 'Maison & Déco', slug: 'maison-deco' }, media: [{ image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', is_primary: true }] },
  115: { id: 115, name: 'Miel Pur du Pays Dogon 1kg', description: 'Miel naturel récolté traditionnellement au Pays Dogon. Saveur unique et bienfaits santé. 100% pur.', base_price: '15000', stock: 30, category: { name: 'Alimentaire' }, store: { id: 6, name: 'Saveurs du Mali', slug: 'saveurs-du-mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop', is_primary: true }] },
  116: { id: 116, name: 'Ballon de Football Adidas Pro', description: 'Ballon officiel de match. Coutures thermosoudées, revêtement premium. Taille 5.', base_price: '35000', stock: 20, category: { name: 'Sport' }, store: { id: 3, name: 'Sport Plus', slug: 'sport-plus' }, media: [{ image_url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&h=800&fit=crop', is_primary: true }] },
  117: { id: 117, name: 'Parfum Femme Chanel N°5', description: 'Eau de parfum légendaire. Notes florales et aldéhydées intemporelles. 100ml. Icône de la parfumerie.', base_price: '185000', stock: 6, category: { name: 'Parfumerie' }, store: { id: 4, name: 'Beauté Plus', slug: 'beaute-plus' }, media: [{ image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&h=800&fit=crop', is_primary: true }] },
  118: { id: 118, name: 'Robot Cuisine Multifonction', description: 'Robot de cuisine 1000W avec 10 accessoires. Mixeur, hachoir, pétrin, râpe. Bol inox 5L.', base_price: '125000', stock: 10, category: { name: 'Cuisine' }, store: { id: 10, name: 'Orca', slug: 'orca' }, media: [{ image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&h=800&fit=crop', is_primary: true }] },
  119: { id: 119, name: 'Chemise Homme Bogolan', description: 'Chemise élégante en tissu bogolan authentique. Coupe moderne, fait main au Mali. 100% coton.', base_price: '28000', stock: 15, category: { name: 'Mode' }, store: { id: 8, name: 'Tendance Afrique', slug: 'tendance-afrique' }, media: [{ image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', is_primary: true }] },
  120: { id: 120, name: 'JBL Flip 6 Enceinte Bluetooth', description: 'Enceinte portable étanche IP67 avec son JBL Original Pro. Jusqu\'à 12h d\'autonomie. PartyBoost.', base_price: '85000', stock: 12, category: { name: 'Électronique' }, store: { id: 1, name: 'Tech Store Mali', slug: 'tech-store-mali' }, media: [{ image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop', is_primary: true }] },
}

// Produits similaires (pour suggestions)
const relatedProducts = [
  { id: 102, name: 'AirPods Pro 2', base_price: '175000', media: [{ image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop' }] },
  { id: 105, name: 'Apple Watch Series 9', base_price: '350000', media: [{ image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop' }] },
  { id: 109, name: 'MacBook Air M3', base_price: '1200000', media: [{ image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' }] },
  { id: 120, name: 'JBL Flip 6', base_price: '85000', media: [{ image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' }] },
]

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

// Avis fictifs
const mockReviews: Review[] = [
  { id: 1, user: 'Amadou K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', rating: 5, comment: 'Excellent produit ! La qualité est au rendez-vous. Livraison rapide et emballage soigné. Je recommande vivement.', date: '2024-01-15', helpful: 12 },
  { id: 2, user: 'Fatou D.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', rating: 4, comment: 'Très bon rapport qualité-prix. Le produit correspond à la description. Seul bémol, le délai de livraison un peu long.', date: '2024-01-10', helpful: 8 },
  { id: 3, user: 'Ibrahim S.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', rating: 5, comment: 'Parfait ! Exactement ce que je cherchais. Le vendeur est très réactif et professionnel.', date: '2024-01-05', helpful: 15 },
  { id: 4, user: 'Mariam T.', rating: 3, comment: 'Produit correct mais je m\'attendais à mieux pour ce prix. La qualité est moyenne.', date: '2023-12-28', helpful: 3 },
]

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
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
      const numId = Number(id)
      
      // Essayer d'abord l'API
      try {
        const response = await productsService.getProduct(numId)
        if (response.data) {
          setProduct(response.data)
          return
        }
      } catch {
        // API a échoué, continuer avec le fallback
      }
      
      // Fallback sur les données fictives
      const mockProduct = mockProductsData[numId]
      if (mockProduct) {
        setProduct(mockProduct as Product)
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'
    return product.media.map(m => {
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
      const message = `Bonjour BuyMore, je souhaite commander:\n\n*Produit:* ${product.name}\n*Quantité:* ${quantity}\n*Prix unitaire:* ${formatPrice(getPrice())} FCFA\n*Montant total:* ${formatPrice(getPrice() * quantity)} FCFA\n\n*Lieu de livraison:* [Veuillez préciser votre adresse]\n\nMerci de me confirmer la disponibilité et les frais de livraison.`
      const whatsappUrl = `https://wa.me/22370009007?text=${encodeURIComponent(message)}`
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
    setIsLiked(!isLiked)
    showToast(isLiked ? 'Retiré des favoris' : 'Ajouté aux favoris !', 'success')
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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">-15%</span>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">En stock</span>
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-[#0f4c2b] shadow-lg ring-2 ring-[#0f4c2b]/20' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {/* Placeholder thumbnails if less than 4 images */}
              {images.length < 4 && [...Array(4 - images.length)].map((_, idx) => (
                <div key={`placeholder-${idx}`} className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">(24 avis)</span>
              <span className="text-sm text-green-600 font-medium">✓ 156 vendus</span>
            </div>

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
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(getPrice() * 1.15)}
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded">-15%</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Truck, text: 'Livraison rapide', sub: 'Sous 24-48h' },
                { icon: Shield, text: 'Garantie', sub: '12 mois' },
                { icon: RefreshCw, text: 'Retour facile', sub: 'Sous 7 jours' },
                { icon: Check, text: 'Authentique', sub: '100% original' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <feature.icon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{feature.text}</p>
                    <p className="text-xs text-gray-500">{feature.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock info */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(product.stock ?? 0) > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {(product.stock ?? 0) > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
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

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.filter(p => p.id !== product.id).map((relProduct) => (
              <Link
                key={relProduct.id}
                to={`/products/${relProduct.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img 
                    src={relProduct.media[0]?.image_url} 
                    alt={relProduct.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors">{relProduct.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(relProduct.base_price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

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
