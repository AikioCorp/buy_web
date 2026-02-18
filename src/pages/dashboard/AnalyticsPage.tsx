import React, { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Eye, ShoppingCart, 
  Users, Package, ArrowUpRight, ArrowDownRight,
  DollarSign, Target, Percent, Loader2
} from 'lucide-react'
import { vendorService } from '../../lib/api/vendorService'

// Stat Card
const StatCard = ({ 
  title, value, change, changeType, icon, color 
}: { 
  title: string
  value: string
  change: string
  changeType: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <div className={`flex items-center gap-1 mt-2 text-sm ${
          changeType === 'up' ? 'text-emerald-600' : 
          changeType === 'down' ? 'text-red-600' : 'text-gray-500'
        }`}>
          {changeType === 'up' ? <ArrowUpRight size={16} /> : 
           changeType === 'down' ? <ArrowDownRight size={16} /> : null}
          <span>{change}</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
)

// Progress Ring
const ProgressRing = ({ percent, label, color }: { percent: number, label: string, color: string }) => {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{percent}%</span>
        </div>
      </div>
      <span className="text-sm text-gray-600 mt-2">{label}</span>
    </div>
  )
}

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    visitors: 0,
    conversionRate: 0,
    products: [] as { name: string; sales: number; revenue: string }[]
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Use lightweight stats endpoint instead of loading ALL orders
      const [statsRes, revenueRes] = await Promise.all([
        vendorService.getStats(),
        vendorService.getRevenue({ page_size: 50 }),
      ])

      let totalRevenue = 0
      let totalOrders = 0
      const topProducts: { name: string; sales: number; revenue: string }[] = []

      if (statsRes.data) {
        const d = (statsRes.data as any).data || statsRes.data
        totalRevenue = d.revenue_total || 0
        totalOrders = d.orders_count || 0
      }

      // Build top products from revenue transactions
      if (revenueRes.data) {
        const rd = (revenueRes.data as any).data || revenueRes.data
        const txns = rd.transactions || []
        const productSales: Record<string, { name: string; sales: number; revenue: number }> = {}
        txns.forEach((txn: any) => {
          const name = txn.product_name || 'Produit'
          if (!productSales[name]) {
            productSales[name] = { name, sales: 0, revenue: 0 }
          }
          productSales[name].sales += txn.quantity || 0
          productSales[name].revenue += parseFloat(txn.total_price) || 0
        })
        const sorted = Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, 5)
        sorted.forEach(p => topProducts.push({ name: p.name, sales: p.sales, revenue: `${p.revenue.toLocaleString()} XOF` }))
      }

      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        visitors: 0,
        conversionRate: 0,
        products: topProducts
      })
    } catch (error) {
      console.error('Erreur chargement analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-500 mt-1">Analysez les performances de votre boutique</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 bg-gray-100 p-1 rounded-xl">
          {[
            { value: '7d', label: '7 jours' },
            { value: '30d', label: '30 jours' },
            { value: '90d', label: '90 jours' },
            { value: '1y', label: '1 an' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.revenue.toLocaleString()} XOF`}
          change={stats.revenue > 0 ? "Données en temps réel" : "Pas encore de ventes"}
          changeType={stats.revenue > 0 ? "up" : "neutral"}
          icon={<DollarSign size={24} className="text-emerald-600" />}
          color="bg-emerald-100"
        />
        <StatCard
          title="Commandes"
          value={stats.orders.toString()}
          change={stats.orders > 0 ? `${stats.orders} commande(s)` : "Pas encore de commandes"}
          changeType={stats.orders > 0 ? "up" : "neutral"}
          icon={<ShoppingCart size={24} className="text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Visiteurs"
          value={stats.visitors.toString()}
          change="Données non disponibles"
          changeType="neutral"
          icon={<Eye size={24} className="text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          title="Taux de conversion"
          value={`${stats.conversionRate}%`}
          change="Données non disponibles"
          changeType="neutral"
          icon={<Percent size={24} className="text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Évolution des ventes</h2>
              <p className="text-sm text-gray-500">Revenus sur la période sélectionnée</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <TrendingUp size={20} />
              <span className="font-semibold">+0%</span>
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p>Pas encore de données de ventes</p>
              <p className="text-sm">Les graphiques apparaîtront après vos premières ventes</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Target size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Objectif mensuel</p>
                  <p className="text-sm text-gray-500">0 / 100,000 XOF</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-500">0%</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: '0%' }}></div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <ProgressRing percent={0} label="Satisfaction" color="#10b981" />
                <ProgressRing percent={0} label="Livraison" color="#3b82f6" />
                <ProgressRing percent={0} label="Réponse" color="#8b5cf6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Produits</h2>
            <span className="text-sm text-gray-500">Par ventes</span>
          </div>
          
          {stats.products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p>Aucun produit vendu</p>
              <p className="text-sm">Vos meilleurs produits apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[150px]">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} vente(s)</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{product.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sources de trafic</h2>
            <span className="text-sm text-gray-500">Ce mois</span>
          </div>
          
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>Pas encore de visiteurs</p>
            <p className="text-sm">Les sources de trafic apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
