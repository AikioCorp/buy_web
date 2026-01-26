import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, TrendingUp, Package, Plus, Store, Rocket,
  ArrowRight, Sparkles, Target, Gift, Users, Eye, Clock,
  CheckCircle2, AlertCircle, Zap, Award, BarChart3, Wallet,
  ShoppingCart, Star, ArrowUpRight
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { shopsService, Shop } from '../../lib/api/shopsService'
import { productsService } from '../../lib/api/productsService'
import { ordersService } from '../../lib/api/ordersService'
import OnboardingTour from '../../components/dashboard/OnboardingTour'

// Stat Card moderne
const StatCard = ({
  title, value, icon, gradient, subtitle, link
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  gradient: string
  subtitle?: string
  link?: string
}) => {
  const content = (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} text-white group cursor-pointer hover:shadow-xl transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
        <div className="w-full h-full rounded-full bg-white/10"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-8 translate-y-8">
        <div className="w-full h-full rounded-full bg-white/5"></div>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            {icon}
          </div>
          {link && <ArrowUpRight size={20} className="text-white/60 group-hover:text-white transition-colors" />}
        </div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
        {subtitle && <p className="text-white/60 text-xs mt-2">{subtitle}</p>}
      </div>
    </div>
  )

  return link ? <Link to={link}>{content}</Link> : content
}

// Welcome Banner pour nouveaux vendeurs
const WelcomeBanner = ({ userName, hasStore }: { userName: string, hasStore: boolean }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 mb-8">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
    
    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles size={28} className="text-yellow-300" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Bienvenue, {userName} ! 👋
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              {hasStore 
                ? "Votre espace vendeur est prêt. Commencez à vendre !"
                : "Créez votre boutique et commencez à vendre sur BuyMore"
              }
            </p>
          </div>
        </div>
        
        {!hasStore && (
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/dashboard/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Store size={20} />
              Créer ma boutique
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
      
      <div className="hidden lg:block">
        <div className="w-48 h-48 relative">
          <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-white/20 rounded-full flex items-center justify-center">
            <Rocket size={64} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Quick Action Card
const QuickActionCard = ({ 
  icon, title, description, link, color 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  link: string
  color: string
}) => (
  <Link 
    to={link}
    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-500">{description}</p>
    <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      <span>Commencer</span>
      <ArrowRight size={16} />
    </div>
  </Link>
)

// Getting Started Checklist
const GettingStartedChecklist = ({ hasStore, productCount }: { hasStore: boolean, productCount: number }) => {
  const steps = [
    { 
      id: 1, 
      title: 'Créer votre boutique', 
      description: 'Configurez votre boutique avec un nom et une description',
      completed: hasStore,
      link: '/dashboard/store'
    },
    { 
      id: 2, 
      title: 'Ajouter votre premier produit', 
      description: 'Ajoutez des produits avec photos et descriptions',
      completed: productCount > 0,
      link: '/dashboard/products'
    },
    { 
      id: 3, 
      title: 'Configurer les paiements', 
      description: 'Activez les méthodes de paiement pour recevoir vos revenus',
      completed: false,
      link: '/dashboard/earnings'
    },
    { 
      id: 4, 
      title: 'Recevoir votre première commande', 
      description: 'Partagez votre boutique et commencez à vendre',
      completed: false,
      link: '/dashboard/orders'
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const progress = (completedCount / steps.length) * 100

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Démarrage rapide</h2>
          <p className="text-sm text-gray-500 mt-1">{completedCount}/{steps.length} étapes complétées</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-emerald-600">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={step.id}
            to={step.link}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              step.completed 
                ? 'bg-emerald-50 border border-emerald-100' 
                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.completed 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step.completed ? <CheckCircle2 size={20} /> : <span className="font-semibold">{index + 1}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${step.completed ? 'text-emerald-700' : 'text-gray-900'}`}>
                {step.title}
              </p>
              <p className="text-sm text-gray-500 truncate">{step.description}</p>
            </div>
            {!step.completed && (
              <ArrowRight size={18} className="text-gray-400" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Empty State Component
const EmptyStateCard = ({ 
  icon, title, description, actionLabel, actionLink 
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  actionLink: string
}) => (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
    <Link
      to={actionLink}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
    >
      <Plus size={18} />
      {actionLabel}
    </Link>
  </div>
)

// Tips Card
const TipsCard = () => {
  const tips = [
    { icon: <Target size={18} />, text: "Ajoutez des photos de qualité pour augmenter vos ventes de 40%" },
    { icon: <Gift size={18} />, text: "Proposez des promotions pour attirer de nouveaux clients" },
    { icon: <Star size={18} />, text: "Répondez rapidement aux questions pour améliorer votre note" },
  ]

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={20} className="text-amber-600" />
        <h3 className="font-semibold text-amber-900">Conseils pour réussir</h3>
      </div>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
              {tip.icon}
            </div>
            <p className="text-sm text-amber-800">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const VendorDashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<Shop | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    views: 0
  })

  useEffect(() => {
    loadDashboardData()
    
    // Vérifier si l'onboarding a déjà été fait
    const onboardingCompleted = localStorage.getItem('onboarding_completed')
    if (!onboardingCompleted) {
      setShowOnboarding(true)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Charger la boutique du vendeur
      const storeResponse = await shopsService.getMyShop()
      if (storeResponse.data) {
        setStore(storeResponse.data)
      }

      // Charger les produits
      const productsResponse = await productsService.getMyProducts()
      if (productsResponse.data) {
        const products = Array.isArray(productsResponse.data) ? productsResponse.data : []
        setStats(prev => ({ ...prev, products: products.length }))
      }

      // Charger les commandes
      const ordersResponse = await ordersService.getOrders()
      if (ordersResponse.data) {
        const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
        setStats(prev => ({ ...prev, orders: orders.length }))
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayName = user?.first_name || user?.username || 'Vendeur'
  const hasStore = !!store

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour 
          onComplete={handleOnboardingComplete} 
          onSkip={handleOnboardingComplete} 
        />
      )}

      {/* Welcome Banner */}
      <WelcomeBanner userName={displayName} hasStore={hasStore} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Produits"
          value={stats.products}
          icon={<Package size={24} className="text-white" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={stats.products === 0 ? "Ajoutez votre premier produit" : "En ligne"}
          link="/dashboard/products"
        />
        <StatCard
          title="Commandes"
          value={stats.orders}
          icon={<ShoppingCart size={24} className="text-white" />}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          subtitle={stats.orders === 0 ? "En attente de commandes" : "Ce mois"}
          link="/dashboard/orders"
        />
        <StatCard
          title="Revenus"
          value={stats.revenue > 0 ? `${stats.revenue.toLocaleString()} XOF` : "0 XOF"}
          icon={<Wallet size={24} className="text-white" />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="Ce mois"
          link="/dashboard/earnings"
        />
        <StatCard
          title="Vues"
          value={stats.views}
          icon={<Eye size={24} className="text-white" />}
          gradient="bg-gradient-to-br from-orange-500 to-amber-500"
          subtitle="Cette semaine"
          link="/dashboard/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Getting Started Checklist */}
        <div className="lg:col-span-2">
          <GettingStartedChecklist hasStore={hasStore} productCount={stats.products} />
        </div>

        {/* Tips */}
        <div>
          <TipsCard />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={<Package size={24} className="text-blue-600" />}
            title="Ajouter un produit"
            description="Créez une nouvelle fiche produit"
            link="/dashboard/products"
            color="bg-blue-100"
          />
          <QuickActionCard
            icon={<Store size={24} className="text-emerald-600" />}
            title="Ma boutique"
            description="Gérez les infos de votre boutique"
            link="/dashboard/store"
            color="bg-emerald-100"
          />
          <QuickActionCard
            icon={<BarChart3 size={24} className="text-purple-600" />}
            title="Statistiques"
            description="Analysez vos performances"
            link="/dashboard/analytics"
            color="bg-purple-100"
          />
          <QuickActionCard
            icon={<ShoppingBag size={24} className="text-orange-600" />}
            title="Commandes"
            description="Gérez vos commandes clients"
            link="/dashboard/orders"
            color="bg-orange-100"
          />
        </div>
      </div>

      {/* Recent Activity / Empty States */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders or Empty State */}
        {stats.orders === 0 ? (
          <EmptyStateCard
            icon={<ShoppingBag size={32} className="text-gray-400" />}
            title="Aucune commande pour le moment"
            description="Vos commandes apparaîtront ici une fois que vous aurez reçu vos premières ventes"
            actionLabel="Voir mes produits"
            actionLink="/dashboard/products"
          />
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Commandes récentes</h2>
              <Link to="/dashboard/orders" className="text-sm text-emerald-600 font-medium hover:underline">
                Voir tout
              </Link>
            </div>
            <p className="text-gray-500 text-sm">Vos dernières commandes apparaîtront ici</p>
          </div>
        )}

        {/* Recent Products or Empty State */}
        {stats.products === 0 ? (
          <EmptyStateCard
            icon={<Package size={32} className="text-gray-400" />}
            title="Aucun produit ajouté"
            description="Commencez par ajouter vos premiers produits pour les mettre en vente"
            actionLabel="Ajouter un produit"
            actionLink="/dashboard/products"
          />
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Mes produits</h2>
              <Link to="/dashboard/products" className="text-sm text-emerald-600 font-medium hover:underline">
                Voir tout
              </Link>
            </div>
            <p className="text-gray-500 text-sm">Vous avez {stats.products} produit(s) en ligne</p>
          </div>
        )}
      </div>

      {/* Help Banner */}
      <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Award size={24} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Besoin d'aide pour démarrer ?</h3>
            <p className="text-gray-400 text-sm">Consultez notre guide du vendeur ou contactez le support</p>
          </div>
        </div>
        <Link
          to="/dashboard/help"
          className="px-5 py-2.5 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Centre d'aide
        </Link>
      </div>
    </div>
  )
}

export default VendorDashboardPage
