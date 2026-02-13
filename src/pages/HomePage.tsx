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
import { shopsService, Shop } from '../lib/api/shopsService'
import { homepageService, HeroSlider, PromoBanner } from '../lib/api/homepageService'
import { flashSalesService, ActiveFlashSale } from '../lib/api/flashSalesService'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useToast } from '../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'

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

// Grandes catégories BuyMore avec sous-catégories
const megaMenuCategories = [
  { 
    id: 1, 
    name: 'Électronique', 
    slug: 'electronique', 
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones' },
      { name: 'Ordinateurs', slug: 'ordinateurs' },
      { name: 'Tablettes', slug: 'tablettes' },
      { name: 'TV & Écrans', slug: 'tv-ecrans' },
      { name: 'Audio & Casques', slug: 'audio-casques' },
      { name: 'Appareils Photo', slug: 'appareils-photo' },
      { name: 'Accessoires', slug: 'accessoires-electronique' },
      { name: 'Jeux Vidéo', slug: 'jeux-video' },
    ]
  },
  { 
    id: 2, 
    name: 'Mode & Vêtements', 
    slug: 'mode-vetements', 
    icon: '👕',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Homme', slug: 'homme' },
      { name: 'Femme', slug: 'femme' },
      { name: 'Enfants', slug: 'enfants' },
      { name: 'Chaussures', slug: 'chaussures' },
      { name: 'Sacs & Bagages', slug: 'sacs-bagages' },
      { name: 'Montres', slug: 'montres' },
      { name: 'Bijoux', slug: 'bijoux' },
      { name: 'Accessoires', slug: 'accessoires-mode' },
    ]
  },
  { 
    id: 3, 
    name: 'Maison & Jardin', 
    slug: 'maison-jardin', 
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Meubles', slug: 'meubles' },
      { name: 'Décoration', slug: 'decoration' },
      { name: 'Literie', slug: 'literie' },
      { name: 'Cuisine', slug: 'cuisine' },
      { name: 'Salle de bain', slug: 'salle-de-bain' },
      { name: 'Jardin', slug: 'jardin' },
      { name: 'Éclairage', slug: 'eclairage' },
      { name: 'Rangement', slug: 'rangement' },
    ]
  },
  { 
    id: 4, 
    name: 'Beauté & Santé', 
    slug: 'beaute-sante', 
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Maquillage', slug: 'maquillage' },
      { name: 'Soins Visage', slug: 'soins-visage' },
      { name: 'Soins Corps', slug: 'soins-corps' },
      { name: 'Parfums', slug: 'parfums' },
      { name: 'Cheveux', slug: 'cheveux' },
      { name: 'Santé', slug: 'sante' },
      { name: 'Bien-être', slug: 'bien-etre' },
      { name: 'Hygiène', slug: 'hygiene' },
    ]
  },
  { 
    id: 5, 
    name: 'Sport & Loisirs', 
    slug: 'sport-loisirs', 
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Football', slug: 'football' },
      { name: 'Basketball', slug: 'basketball' },
      { name: 'Natation', slug: 'natation' },
      { name: 'Cyclisme', slug: 'cyclisme' },
      { name: 'Camping', slug: 'camping' },
      { name: 'Yoga', slug: 'yoga' },
      { name: 'Équipements', slug: 'equipements-sport' },
    ]
  },
  { 
    id: 6, 
    name: 'Alimentation', 
    slug: 'alimentation', 
    icon: '🍎',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Épicerie', slug: 'epicerie' },
      { name: 'Boissons', slug: 'boissons' },
      { name: 'Fruits & Légumes', slug: 'fruits-legumes' },
      { name: 'Produits Frais', slug: 'produits-frais' },
      { name: 'Surgelés', slug: 'surgeles' },
      { name: 'Bio', slug: 'bio' },
      { name: 'Snacks', slug: 'snacks' },
      { name: 'Bébé', slug: 'alimentation-bebe' },
    ]
  },
  { 
    id: 7, 
    name: 'Bébé & Enfant', 
    slug: 'bebe-enfant', 
    icon: '👶',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Vêtements Bébé', slug: 'vetements-bebe' },
      { name: 'Jouets', slug: 'jouets' },
      { name: 'Puériculture', slug: 'puericulture' },
      { name: 'Alimentation', slug: 'alimentation-bebe' },
      { name: 'Hygiène Bébé', slug: 'hygiene-bebe' },
      { name: 'Mobilier Bébé', slug: 'mobilier-bebe' },
      { name: 'Jeux Éducatifs', slug: 'jeux-educatifs' },
      { name: 'Sécurité', slug: 'securite-bebe' },
    ]
  },
  { 
    id: 8, 
    name: 'Auto & Moto', 
    slug: 'auto-moto', 
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&h=400&fit=crop',
    subcategories: [
      { name: 'Pièces Auto', slug: 'pieces-auto' },
      { name: 'Accessoires Auto', slug: 'accessoires-auto' },
      { name: 'Pneus', slug: 'pneus' },
      { name: 'Entretien', slug: 'entretien-auto' },
      { name: 'Pièces Moto', slug: 'pieces-moto' },
      { name: 'Casques', slug: 'casques' },
      { name: 'GPS & Navigation', slug: 'gps-navigation' },
      { name: 'Outillage', slug: 'outillage-auto' },
    ]
  },
]

// Format pour compatibilité mobile
const mainCategories = megaMenuCategories.map(cat => ({
  name: cat.name,
  slug: cat.slug,
  icon: Laptop,
  color: 'bg-green-600',
  image: cat.image
}))

// Couleurs pour les boutiques en vedette
const shopColors = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-teal-500 to-green-600',
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
]


interface DynamicCategory {
  id: number
  name: string
  slug: string
  icon?: string
  image?: string
  parent?: number | null
  children?: DynamicCategory[]
}

// Données par défaut (fallback)
const defaultHeroBanners = [
  { title: 'Nouvelle Collection', subtitle: 'Mode Africaine 2025', description: 'Découvrez les dernières tendances', bg_color: 'from-purple-600 to-pink-600', image_url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=400&fit=crop', cta_text: 'Découvrir', cta_link: '/shops?category=mode' },
  { title: 'Flash Sale', subtitle: 'Jusqu\'à -70%', description: 'Offres limitées sur l\'électronique', bg_color: 'from-red-600 to-orange-500', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop', cta_text: 'En profiter', cta_link: '/deals' },
  { title: 'Livraison Gratuite', subtitle: 'Sur +50 000 FCFA', description: 'Partout à Bamako', bg_color: 'from-green-600 to-emerald-500', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop', cta_text: 'Commander', cta_link: '/shops' },
]

const defaultPromoBanners = [
  { title: 'Smartphones', subtitle: 'Dernière génération', discount: '-30%', bg_color: 'from-blue-600 to-indigo-700', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=200&fit=crop' },
  { title: 'Électroménager', subtitle: 'Qualité premium', discount: '-25%', bg_color: 'from-orange-500 to-red-600', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop' },
  { title: 'Mode Africaine', subtitle: 'Créations uniques', discount: '-40%', bg_color: 'from-purple-600 to-pink-600', image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=200&fit=crop' },
]

export function HomePage() {
  const { products: apiProducts, refresh: refreshProducts } = useProducts()
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<DynamicCategory | null>(null)
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const { showToast } = useToast()

  // États pour le contenu dynamique de la homepage
  const [heroSliders, setHeroSliders] = useState<any[]>(defaultHeroBanners)
  const [promoBannersData, setPromoBannersData] = useState<any[]>(defaultPromoBanners)
  const [currentPromoBanner, setCurrentPromoBanner] = useState(0)
  const [featuredTopVentes, setFeaturedTopVentes] = useState<any[]>([])
  const [activeFlashSale, setActiveFlashSale] = useState<ActiveFlashSale | null>(null)

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [flashDealsScrollRef, setFlashDealsScrollRef] = useState<HTMLDivElement | null>(null)
  const [popularScrollRef, setPopularScrollRef] = useState<HTMLDivElement | null>(null)
  const [menScrollRef, setMenScrollRef] = useState<HTMLDivElement | null>(null)
  const [womenScrollRef, setWomenScrollRef] = useState<HTMLDivElement | null>(null)
  const [kidsScrollRef, setKidsScrollRef] = useState<HTMLDivElement | null>(null)
  const [foodScrollRef, setFoodScrollRef] = useState<HTMLDivElement | null>(null)
  const [beautyScrollRef, setBeautyScrollRef] = useState<HTMLDivElement | null>(null)
  const [kitchenScrollRef, setKitchenScrollRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    refreshProducts()
    loadCategories()
    loadShops()
    loadHomepageContent()
    loadActiveFlashSale()
  }, [])

  const loadHomepageContent = async () => {
    try {
      const response = await homepageService.getHomepageContent()
      if (response.data) {
        if (response.data.sliders && response.data.sliders.length > 0) {
          setHeroSliders(response.data.sliders)
        }
        if (response.data.banners && response.data.banners.length > 0) {
          setPromoBannersData(response.data.banners)
        }
        // Charger les produits vedettes
        if (response.data.featuredProducts) {
          if (response.data.featuredProducts.top_ventes) {
            setFeaturedTopVentes(response.data.featuredProducts.top_ventes)
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement contenu homepage:', error)
    }
  }

  const loadActiveFlashSale = async () => {
    try {
      const response = await flashSalesService.getActiveFlashSale()
      if (response.data) {
        setActiveFlashSale(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement Flash Sale:', error)
    }
  }

  // Auto-scroll for Flash Deals
  useEffect(() => {
    if (!flashDealsScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = flashDealsScrollRef.scrollWidth
      const clientWidth = flashDealsScrollRef.clientWidth
      const currentScroll = flashDealsScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        flashDealsScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        flashDealsScrollRef.scrollBy({ left: 200, behavior: 'smooth' })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [flashDealsScrollRef])

  // Auto-scroll for Popular Products
  useEffect(() => {
    if (!popularScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = popularScrollRef.scrollWidth
      const clientWidth = popularScrollRef.clientWidth
      const currentScroll = popularScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        popularScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        popularScrollRef.scrollBy({ left: 200, behavior: 'smooth' })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [popularScrollRef])

  // Auto-scroll for Men Section (3.5s interval)
  useEffect(() => {
    if (!menScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = menScrollRef.scrollWidth
      const clientWidth = menScrollRef.clientWidth
      const currentScroll = menScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        menScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        menScrollRef.scrollBy({ left: 180, behavior: 'smooth' })
      }
    }, 3500)
    return () => clearInterval(interval)
  }, [menScrollRef])

  // Auto-scroll for Women Section (4s interval)
  useEffect(() => {
    if (!womenScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = womenScrollRef.scrollWidth
      const clientWidth = womenScrollRef.clientWidth
      const currentScroll = womenScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        womenScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        womenScrollRef.scrollBy({ left: 220, behavior: 'smooth' })
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [womenScrollRef])

  // Auto-scroll for Kids Section (3.2s interval)
  useEffect(() => {
    if (!kidsScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = kidsScrollRef.scrollWidth
      const clientWidth = kidsScrollRef.clientWidth
      const currentScroll = kidsScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        kidsScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        kidsScrollRef.scrollBy({ left: 190, behavior: 'smooth' })
      }
    }, 3200)
    return () => clearInterval(interval)
  }, [kidsScrollRef])

  // Auto-scroll for Food Section (4.5s interval)
  useEffect(() => {
    if (!foodScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = foodScrollRef.scrollWidth
      const clientWidth = foodScrollRef.clientWidth
      const currentScroll = foodScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        foodScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        foodScrollRef.scrollBy({ left: 210, behavior: 'smooth' })
      }
    }, 4500)
    return () => clearInterval(interval)
  }, [foodScrollRef])

  // Auto-scroll for Beauty Section (3.8s interval)
  useEffect(() => {
    if (!beautyScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = beautyScrollRef.scrollWidth
      const clientWidth = beautyScrollRef.clientWidth
      const currentScroll = beautyScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        beautyScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        beautyScrollRef.scrollBy({ left: 195, behavior: 'smooth' })
      }
    }, 3800)
    return () => clearInterval(interval)
  }, [beautyScrollRef])

  // Auto-scroll for Kitchen Section (4.2s interval)
  useEffect(() => {
    if (!kitchenScrollRef) return
    const interval = setInterval(() => {
      const scrollWidth = kitchenScrollRef.scrollWidth
      const clientWidth = kitchenScrollRef.clientWidth
      const currentScroll = kitchenScrollRef.scrollLeft

      if (currentScroll + clientWidth >= scrollWidth - 10) {
        kitchenScrollRef.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        kitchenScrollRef.scrollBy({ left: 205, behavior: 'smooth' })
      }
    }, 4200)
    return () => clearInterval(interval)
  }, [kitchenScrollRef])

  // Countdown dynamique pour Flash Sale
  useEffect(() => {
    if (!activeFlashSale?.flashSale?.end_date) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(activeFlashSale.flashSale.end_date).getTime()
      const diff = end - now

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [activeFlashSale])

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

  const loadShops = async () => {
    try {
      const response = await shopsService.getPublicShops(1, 12)
      if (response.data?.results && response.data.results.length > 0) {
        setShops(response.data.results)
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        setShops(response.data)
      }
    } catch (error) {
      console.error('Error loading shops:', error)
    }
  }

  // Boutiques en vedette (4 premières)
  const featuredShops = shops.slice(0, 4)
  // Toutes les boutiques
  const allShopsData = shops

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

  // Filtrer uniquement les catégories parentes (parent === null)
  const parentCategories = dynamicCategories.filter(cat => cat.parent === null || cat.parent === undefined)

  // Obtenir les produits d'une catégorie (incluant les sous-catégories)
  const getCategoryProducts = (cat: DynamicCategory) => {
    const childSlugs = cat.children?.map(c => c.slug) || []
    return allProducts.filter((p: any) => 
      p.category?.slug === cat.slug || 
      p.category?.id === cat.id ||
      childSlugs.includes(p.category?.slug)
    ).slice(0, 6)
  }


  useEffect(() => {
    const interval = setInterval(() => setCurrentBanner(prev => (prev + 1) % heroSliders.length), 5000)
    return () => clearInterval(interval)
  }, [heroSliders.length])

  // Auto-slide pour bannières promo si > 3
  useEffect(() => {
    if (promoBannersData.length <= 3) return
    const interval = setInterval(() => {
      setCurrentPromoBanner(prev => (prev + 1) % promoBannersData.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [promoBannersData.length])

  const allProducts = apiProducts || []
  
  // Flash Deals: utiliser les produits de la Flash Sale active si disponible, sinon les produits en promo
  const flashSaleProducts = activeFlashSale?.products?.map(fp => fp.product).filter(Boolean) || []
  const promoProducts = allProducts.filter((p: any) => 
    p.promo_price && Number(p.promo_price) > 0 && Number(p.promo_price) < Number(p.base_price)
  )
  const dealProducts = flashSaleProducts.length > 0 ? flashSaleProducts : promoProducts.slice(0, 12)
  
  // Produits populaires: basés sur les ventes (order_count) ou vues (view_count) si disponibles
  const trendingProducts = [...allProducts].sort((a: any, b: any) => {
    const aScore = (a.order_count || 0) * 2 + (a.view_count || 0)
    const bScore = (b.order_count || 0) * 2 + (b.view_count || 0)
    return bScore - aScore
  }).slice(0, 12)
  
  const newArrivals = allProducts.slice(0, 16)
  const bestSellers = [...allProducts].sort((a: any, b: any) => (b.order_count || 0) - (a.order_count || 0)).slice(0, 12)
  
  // Calculer le pourcentage de réduction réel
  const getDiscountPercent = (product: any) => {
    if (!product.promo_price || Number(product.promo_price) >= Number(product.base_price)) return 0
    return Math.round((1 - Number(product.promo_price) / Number(product.base_price)) * 100)
  }

  const formatPrice = (price: string | number) => new Intl.NumberFormat('fr-FR').format(Number(price))

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % heroSliders.length)
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + heroSliders.length) % heroSliders.length)

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
      to={`/products/${product.slug || product.id}`}
      className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Product Banner - Enhanced */}
        {showDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
            -{15 + (index % 5) * 10}% OFF
          </div>
        )}
        {index < 3 && !showDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
            🔥 HOT
          </div>
        )}
        {index === 0 && (
          <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            ⭐ TOP
          </div>
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
            {/* Sidebar Catégories - Design BuyMore Moderne */}
            <div className="hidden lg:block w-60 flex-shrink-0 relative" onMouseLeave={() => setHoveredCategory(null)}>
              {/* Header avec couleurs BuyMore */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl px-4 py-3 flex items-center gap-2 shadow-lg">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white/60 rounded-full" />)}
                </div>
                <span className="font-bold text-sm">Nos Catégories</span>
              </div>
              
              {/* Liste des grandes catégories */}
              <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-lg">
                {megaMenuCategories.map((cat) => {
                  const isHovered = (hoveredCategory as any)?.id === cat.id
                  
                  return (
                    <div 
                      key={cat.id}
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(cat as any)}
                    >
                      <Link 
                        to={`/products?category=${cat.slug}`}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                          isHovered 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500' 
                            : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <span className={`text-xl flex-shrink-0 transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}>
                          {cat.icon}
                        </span>
                        <span className={`text-sm flex-1 font-medium transition-colors ${
                          isHovered ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {cat.name}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                          isHovered ? 'text-green-600 translate-x-1' : 'text-gray-400'
                        }`} />
                      </Link>
                    </div>
                  )
                })}
                
                {/* Voir toutes les catégories */}
                <Link 
                  to="/categories" 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-green-600 font-semibold text-sm hover:bg-green-50 transition-colors rounded-b-xl"
                >
                  <FolderTree className="w-4 h-4" />
                  Toutes les catégories
                </Link>
              </div>
              
              {/* Mega Menu Moderne - Couleurs BuyMore */}
              {hoveredCategory && (
                <div 
                  className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  style={{ width: '580px' }}
                  onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Header du Mega Menu */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{(hoveredCategory as any).icon}</span>
                      <div>
                        <h3 className="text-white font-bold text-lg">{(hoveredCategory as any).name}</h3>
                        <p className="text-white/80 text-sm">Découvrez notre sélection</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    {/* Sous-catégories */}
                    <div className="flex-1 p-5">
                      {/* Liens rapides */}
                      <div className="flex gap-4 mb-4 pb-3 border-b border-gray-100">
                        <Link 
                          to={`/products?category=${(hoveredCategory as any).slug}&sort=newest`} 
                          className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                        >
                          <Sparkles className="w-3 h-3" /> Nouveautés
                        </Link>
                        <Link 
                          to={`/products?category=${(hoveredCategory as any).slug}&promo=true`} 
                          className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 hover:underline"
                        >
                          <Zap className="w-3 h-3" /> Promotions
                        </Link>
                      </div>
                      
                      {/* Sous-catégories en 2 colonnes */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {((hoveredCategory as any).subcategories || []).map((sub: any, idx: number) => (
                          <Link 
                            key={idx}
                            to={`/products?category=${sub.slug}`}
                            className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-green-600 transition-colors group"
                          >
                            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                      
                      {/* Bouton voir tout */}
                      <Link 
                        to={`/products?category=${(hoveredCategory as any).slug}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
                      >
                        Voir tous les produits
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    
                    {/* Image grande à droite */}
                    <div className="w-52 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                      <img 
                        src={(hoveredCategory as any).image} 
                        alt={(hoveredCategory as any).name}
                        className="w-full h-auto object-cover rounded-xl shadow-lg max-h-[260px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hero Carousel */}
            <div className="flex-1">
              <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                {heroSliders.map((banner, index) => (
                  <div key={index} className={`absolute inset-0 transition-all duration-700 ${currentBanner === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className={`h-full bg-gradient-to-r ${banner.bg_color} flex items-center relative`}>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <img src={banner.image_url} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50" style={{ objectPosition: banner.image_position || 'center center' }} />
                      <div className="container mx-auto px-6 md:px-12 relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm mb-3">{banner.subtitle}</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{banner.title}</h1>
                        <p className="text-white/90 mb-6 text-lg">{banner.description}</p>
                        <Link to={banner.cta_link} className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors">
                          {banner.cta_text} <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/60 transition-all shadow-lg cursor-pointer"><ChevronLeft className="w-7 h-7" /></button>
                <button onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/60 transition-all shadow-lg cursor-pointer"><ChevronRight className="w-7 h-7" /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSliders.map((_, index) => (<button key={index} onClick={() => setCurrentBanner(index)} className={`h-2 rounded-full transition-all ${currentBanner === index ? 'bg-white w-8' : 'bg-white/50 w-2'}`} />))}
                </div>
              </div>

              {/* Mini Banners - Toujours afficher 3 à la fois avec slider si > 3 */}
              <div className="relative mt-4">
                <div className="grid grid-cols-3 gap-3 overflow-hidden">
                  {/* Afficher 3 bannières à la fois */}
                  {[0, 1, 2].map((offset) => {
                    const index = (currentPromoBanner + offset) % promoBannersData.length
                    const banner = promoBannersData[index]
                    if (!banner) return null
                    
                    return (
                      <Link 
                        key={index} 
                        to={banner.link || '/deals'} 
                        className={`relative h-24 md:h-28 rounded-xl overflow-hidden bg-gradient-to-r ${banner.bg_color} group transition-all duration-700`}
                      >
                        <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" style={{ objectPosition: banner.image_position || 'center center' }} />
                        <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                          <div>
                            <p className="text-white/80 text-xs">{banner.subtitle}</p>
                            <h4 className="text-white font-bold text-sm md:text-base">{banner.title}</h4>
                          </div>
                          <span className="text-yellow-300 font-black text-lg">{banner.discount}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                
              </div>
            </div>

            {/* Sidebar Produits - Desktop */}
            <div className="hidden xl:block w-56 flex-shrink-0">
              <div className="bg-orange-500 text-white rounded-t-xl px-4 py-3">
                <h3 className="font-bold flex items-center gap-2"><Zap className="w-5 h-5" /> Top Ventes</h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm divide-y divide-gray-100">
                {featuredTopVentes.length > 0 ? (
                  featuredTopVentes.slice(0, 6).map((featured) => {
                    const product = featured.product
                    if (!product) return null
                    
                    return (
                      <Link key={product.id} to={`/products/${product.slug || product.id}`} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors">
                        {(product.images?.[0]?.image_url || product.media?.[0]?.image_url) ? (
                          <img src={product.images?.[0]?.image_url || product.media?.[0]?.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center"><Package className="w-7 h-7 text-gray-400" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                          <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(product.base_price)} FCFA</p>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Aucun produit vedette
                  </div>
                )}
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

      {/* Catégories Mobile - Utilise les vraies catégories parentes */}
      <section className="lg:hidden py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Catégories</h2>
            <Link to="/categories" className="text-green-600 text-sm font-medium flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {(parentCategories.length > 0 ? parentCategories : mainCategories).slice(0, 12).map((cat: any, index: number) => {
              const catImage = parentCategories.length > 0 ? getCategoryImage(cat) : cat.image
              const colors = ['bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-cyan-500', 'bg-red-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500']
              const bgColor = cat.color || colors[index % colors.length]
              
              return (
                <Link 
                  key={cat.slug || cat.id} 
                  to={`/products?category=${cat.slug}`} 
                  className="flex flex-col items-center gap-2 min-w-[70px]"
                >
                  <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center shadow-lg overflow-hidden ring-2 ring-white`}>
                    {catImage ? (
                      <img src={catImage} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-gray-700 font-medium text-center line-clamp-1 w-16">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Boutiques en vedette */}
      {/* Boutiques en vedette - Afficher seulement si des boutiques existent */}
      {featuredShops.length > 0 && (
        <section className="py-6 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Boutiques en vedette</h2>
              <Link to="/shops" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {featuredShops.map((shop, index) => (
                <Link key={shop.id} to={`/shops/${shop.id}`} className="relative overflow-hidden rounded-xl hover:scale-[1.02] transition-transform shadow-lg group">
                  {/* Shop Banner Image as Background */}
                  {shop.banner_url ? (
                    <div className="absolute inset-0">
                      <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${shopColors[index % shopColors.length]}`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-6 text-white">
                    {/* Shop Logo - Larger and more prominent */}
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 overflow-hidden shadow-md">
                      {shop.logo_url ? (
                        <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-gray-600" />
                      )}
                    </div>

                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <p className="text-white/90 text-sm mb-2">{shop.category || shop.city || 'Boutique'}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span className="text-sm font-semibold">{shop.rating || 4.5}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Toutes les boutiques - Afficher seulement si des boutiques existent */}
      {allShopsData.length > 0 && (
        <section className="py-4 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Toutes les boutiques</h2>
              <Link to="/shops" className="text-green-600 text-sm font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {allShopsData.map((shop) => (
                <Link key={shop.id} to={`/shops/${shop.id}`} className="flex flex-col items-center gap-2 min-w-[80px] group">
                  <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center overflow-hidden group-hover:border-green-400 transition-colors">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <span className="text-xs text-gray-700 font-medium text-center line-clamp-2 max-w-[80px] group-hover:text-green-600">{shop.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Deals */}
      {(activeFlashSale || dealProducts.length > 0) && (
        <section className={`py-6 bg-gradient-to-r ${activeFlashSale?.flashSale?.bg_color || 'from-red-500 to-orange-500'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Zap className="w-6 h-6 text-yellow-300" /></div>
                <div>
                  <h2 className="text-xl font-bold text-white">{activeFlashSale?.flashSale?.title || 'Ventes Flash'}</h2>
                  <p className="text-white/80 text-sm">{activeFlashSale?.flashSale?.description || 'Offres limitées - Dépêchez-vous!'}</p>
                </div>
              </div>
              {activeFlashSale && (
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-sm">Se termine dans:</span>
                  <div className="flex gap-1">
                    {countdown.days > 0 && (
                      <div className="bg-white rounded-lg px-3 py-2 text-center min-w-[50px]">
                        <div className="text-xl font-black text-red-500">{String(countdown.days).padStart(2, '0')}</div>
                        <div className="text-[10px] text-gray-500 font-medium">J</div>
                      </div>
                    )}
                    {[
                      { value: countdown.hours, label: 'H' }, 
                      { value: countdown.minutes, label: 'M' }, 
                      { value: countdown.seconds, label: 'S' }
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-lg px-3 py-2 text-center min-w-[50px]">
                        <div className="text-xl font-black text-red-500">{String(item.value).padStart(2, '0')}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          {/* Mobile: Horizontal Slider | Desktop: Grid */}
          <div ref={setFlashDealsScrollRef} className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide snap-x snap-mandatory md:snap-none">
            {dealProducts.length > 0 ? dealProducts.map((product: any) => (
              <Link key={product.id} to={`/products/${product.slug || product.id}`} className="group bg-white rounded-xl overflow-hidden shadow-lg min-w-[160px] md:min-w-0 snap-start">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{getDiscountPercent(product)}%</div>
                  {(getImageUrl(product) || product.media?.[0]?.image_url) ? (
                    <img src={getImageUrl(product) || product.media?.[0]?.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (<div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="h-10 w-10" /></div>)}
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-gray-900 text-xs line-clamp-2 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600 font-bold text-sm">{formatPrice(product.promo_price)} FCFA</span>
                    <span className="text-gray-400 text-xs line-through">{formatPrice(product.base_price)}</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-8 text-white/80">
                <p>Aucune promotion en cours</p>
                <p className="text-sm">Revenez bientôt pour découvrir nos offres !</p>
              </div>
            )}
          </div>
        </div>
        </section>
      )}

      {/* Produits Populaires - Horizontal Slider with Auto-scroll */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Produits Populaires</h2>
            <Link to="/products" className="text-green-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => popularScrollRef?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg hover:bg-green-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => popularScrollRef?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg hover:bg-green-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div ref={setPopularScrollRef} className="flex gap-4 overflow-x-scroll pb-4 snap-x snap-mandatory scrollbar-hide">
              {trendingProducts.slice(0, 10).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[240px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Hommes - Creative Design with Slider */}
      <section className="py-8 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Mode Homme
              </h2>
              <p className="text-gray-600 text-sm mt-1">Style et élégance masculine</p>
            </div>
            <Link to="/products?category=mode-homme" className="text-slate-700 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div ref={setMenScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {allProducts.filter((p: any) => {
                const name = p.name?.toLowerCase() || '';
                const cat = p.category?.name?.toLowerCase() || '';
                return (cat.includes('homme') || name.includes(' homme') || name.includes('masculin') ||
                  name.includes('polo') || name.includes('chemise') || name.includes('costume')) &&
                  !name.includes('femme') && !name.includes('fille');
              }).slice(0, 6).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[240px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Femmes - New Creative Design */}
      <section className="py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Banner Image */}
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&h=400&fit=crop"
              alt="Mode Femme"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/70 to-purple-900/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-3">Mode Femme</h2>
                <p className="text-xl md:text-2xl font-light">Élégance & Raffinement</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-700 text-lg">Découvrez notre collection exclusive pour femmes</p>
          </div>

          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => womenScrollRef?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:bg-pink-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => womenScrollRef?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:bg-pink-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div ref={setWomenScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-2">
              {allProducts.filter((p: any) => {
                const name = p.name?.toLowerCase() || '';
                const cat = p.category?.name?.toLowerCase() || '';
                const womenKeywords = ['robe', 'jupe', 'blouse', 'top femme', 'legging', 'talon', 'femme', 'féminin', 'sac à main', 'maquillage', 'perruque'];
                return (cat.includes('femme') || womenKeywords.some(key => name.includes(key))) &&
                  !name.includes('homme') && !name.includes('garçon');
              }).slice(0, 6).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[140px] md:min-w-[200px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/products?category=mode-femme" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
              Découvrir la collection <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section Enfants - Creative Design with Slider */}
      <section className="py-8 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Univers Enfants
              </h2>
              <p className="text-gray-600 text-sm mt-1">Jouets, vêtements et accessoires pour les petits</p>
            </div>
            <Link to="/products?category=enfants" className="text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div ref={setKidsScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {allProducts.filter((p: any) => {
                const name = p.name?.toLowerCase() || '';
                const cat = p.category?.name?.toLowerCase() || '';
                return (cat.includes('enfant') || cat.includes('bébé') || cat.includes('jouet') ||
                  name.includes('enfant') || name.includes('bébé') || name.includes('jouet') ||
                  name.includes('fille') || name.includes('garçon')) &&
                  !name.includes('homme') && !name.includes('femme');
              }).slice(0, 6).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[240px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Produits Alimentaires - Creative Design with Slider */}
      <section className="py-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Produits Alimentaires
              </h2>
              <p className="text-gray-600 text-sm mt-1">Frais, savoureux et de qualité</p>
            </div>
            <Link to="/products?category=alimentaire" className="text-green-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div ref={setFoodScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {allProducts.filter((p: any) => {
                const name = p.name?.toLowerCase() || '';
                const cat = p.category?.name?.toLowerCase() || '';
                const foodKeywords = ['chocolat', 'biscuit', 'café', 'thé', 'jus', 'eau', 'boisson', 'snack', 'chips', 'bonbon', 'riz', 'sucre', 'huile', 'lait', 'pâtes'];
                return cat.includes('alimentaire') || cat.includes('alimentation') || cat.includes('nourriture') || cat.includes('food') ||
                  foodKeywords.some(key => name.includes(key));
              }).slice(0, 6).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[240px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Beauté - Creative Design with Slider */}
      <section className="py-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Beauté & Parfumerie
              </h2>
              <p className="text-gray-600 text-sm mt-1">Sublimez votre beauté naturelle</p>
            </div>
            <Link to="/products?category=beaute" className="text-purple-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div ref={setBeautyScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {allProducts.filter((p: any) => p.category?.name?.toLowerCase().includes('beauté') || p.category?.name?.toLowerCase().includes('parfum')).slice(0, 6).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[240px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Cuisine - Creative Design with Slider */}
      <section className="py-8 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Art Culinaire
              </h2>
              <p className="text-gray-600 text-sm mt-1">Équipez votre cuisine comme un chef</p>
            </div>
            <Link to="/products?category=cuisine" className="text-orange-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div ref={setKitchenScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {allProducts.filter((p: any) => p.category?.name?.toLowerCase().includes('cuisine') || p.category?.name?.toLowerCase().includes('ustensile')).slice(0, 6).map((product: any, index: number) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[240px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
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
