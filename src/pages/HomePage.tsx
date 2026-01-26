import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, ShoppingCart, Star, ChevronRight, Truck, Shield, 
  CreditCard, Clock, ArrowRight, Heart, Eye, Store, UtensilsCrossed,
  Sparkles, TrendingUp, Gift, Percent
} from 'lucide-react'
import { Card, CardContent } from '../components/Card'
import { Hero } from '../components/Hero'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'

const categoryIcons: Record<string, React.ReactNode> = {
  'alimentaire': <Package className="w-8 h-8" />,
  'parfumerie': <Sparkles className="w-8 h-8" />,
  'cuisine': <UtensilsCrossed className="w-8 h-8" />,
  'mode': <Gift className="w-8 h-8" />,
  'restauration': <UtensilsCrossed className="w-8 h-8" />,
  'default': <Package className="w-8 h-8" />
}

const getCategoryIcon = (slug: string) => {
  const key = Object.keys(categoryIcons).find(k => slug.toLowerCase().includes(k))
  return categoryIcons[key || 'default']
}

const featuredShops = [
  { name: 'Shopreate', category: 'Alimentaire', color: 'from-green-500 to-emerald-600', icon: '🛒' },
  { name: 'Orca', category: 'Cuisine & Aménagement', color: 'from-blue-500 to-cyan-600', icon: '🏠' },
  { name: 'Dicarlo', category: 'Parfumerie', color: 'from-purple-500 to-pink-600', icon: '✨' },
  { name: 'Carré Marché', category: 'Alimentaire & Cuisine', color: 'from-orange-500 to-red-600', icon: '🍎' }
]

export function HomePage() {
  const { products, isLoading: productsLoading, refresh: refreshProducts } = useProducts()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  useEffect(() => {
    refreshProducts()
  }, [])

  const loading = productsLoading || categoriesLoading
  const displayProducts = products?.slice(0, 8) || []
  const displayCategories = categories?.slice(0, 5) || []
  const trendingProducts = products?.slice(0, 4) || []

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price))
  }

  return (
    <div className="bg-gray-50">
      <Hero />

      {/* Avantages */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Livraison Bamako</p>
                <p className="text-xs text-gray-500">1 000 FCFA seulement</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Paiement Sécurisé</p>
                <p className="text-xs text-gray-500">Wave, Orange Money</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Paiement Mobile</p>
                <p className="text-xs text-gray-500">Sama, Moov Africa</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Support 24/7</p>
                <p className="text-xs text-gray-500">Assistance rapide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boutiques Partenaires */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Boutiques Partenaires</h2>
              <p className="text-gray-600 mt-1">Découvrez nos boutiques de confiance</p>
            </div>
            <Link to="/shops" className="hidden md:flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
              Voir toutes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredShops.map((shop, index) => (
              <Link 
                key={index}
                to={`/shops`}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${shop.color} p-6 text-white hover:scale-105 transition-transform duration-300 shadow-lg`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="text-4xl mb-4">{shop.icon}</div>
                <h3 className="font-bold text-lg">{shop.name}</h3>
                <p className="text-white/80 text-sm">{shop.category}</p>
                <div className="mt-4 flex items-center gap-1 text-sm">
                  <Store className="w-4 h-4" />
                  <span>Visiter</span>
                </div>
              </Link>
            ))}
          </div>
          
          <Link to="/shops" className="md:hidden flex items-center justify-center gap-2 mt-6 text-green-600 hover:text-green-700 font-medium">
            Voir toutes les boutiques <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Catégories</h2>
              <p className="text-gray-600 mt-1">Explorez par catégorie</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shops?category=${category.slug}`}
                className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-green-50 transition-all duration-300 border border-gray-100 hover:border-green-200 hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <span className="text-green-600">
                    {getCategoryIcon(category.slug)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Voir les produits</p>
                <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produits Tendance */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Tendances</h2>
                <p className="text-gray-600">Les plus populaires</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingProducts.map((product, index) => (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`}
                className="group"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {index === 0 && (
                      <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        🔥 HOT
                      </div>
                    )}
                    {product.media?.[0]?.image_url ? (
                      <img
                        src={product.media[0].image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="h-16 w-16" />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}>
                      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(24)</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{product.store?.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(product.base_price)} <span className="text-xs font-normal">FCFA</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière Promo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
                  <Percent className="w-4 h-4 text-yellow-300" />
                  <span className="text-white text-sm font-medium">Offre Spéciale</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Livraison Gratuite
                </h2>
                <p className="text-white/90 text-lg">
                  Sur votre première commande avec le code <span className="font-bold text-yellow-300">BIENVENUE</span>
                </p>
              </div>
              <Link 
                to="/shops"
                className="flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-bold hover:bg-yellow-400 hover:text-green-800 transition-colors shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Commander maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Produits Récents */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Nouveautés</h2>
              <p className="text-gray-600 mt-1">Les derniers produits ajoutés</p>
            </div>
            <Link to="/shops" className="hidden md:flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gray-50 group-hover:bg-white">
                    <div className="relative aspect-square bg-white overflow-hidden">
                      {product.media?.[0]?.image_url ? (
                        <img
                          src={product.media[0].image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{product.store?.name}</p>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(product.base_price)} <span className="text-xs font-normal text-gray-500">FCFA</span>
                        </p>
                        <button className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          
          <Link to="/shops" className="md:hidden flex items-center justify-center gap-2 mt-6 text-green-600 hover:text-green-700 font-medium">
            Voir tous les produits <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Section Restaurants */}
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Restaurants</h2>
                <p className="text-gray-600">Commandez vos plats préférés</p>
              </div>
            </div>
            <Link to="/restaurants" className="hidden md:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
              Voir les restaurants <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bientôt disponible</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Notre section restauration arrive bientôt ! Commandez vos plats préférés directement depuis BuyMore.
              </p>
              <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors">
                Me notifier
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Restez informé des nouveautés
            </h2>
            <p className="text-gray-400 mb-8">
              Inscrivez-vous à notre newsletter pour recevoir les dernières offres et promotions
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-green-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
