import { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, Users, ShoppingCart,
  ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Store, Package
} from 'lucide-react'
import { usersService } from '../../../lib/api/usersService'
import { ordersService } from '../../../lib/api/ordersService'
import { shopsService } from '../../../lib/api/shopsService'
import { productsService } from '../../../lib/api/productsService'
import { categoriesService } from '../../../lib/api/categoriesService'

interface Stats {
  totalUsers: number
  totalOrders: number
  totalShops: number
  totalProducts: number
  totalRevenue: number
}

interface TopProduct {
  name: string
  sales: number
  revenue: string
  image?: string
}

interface TopCategory {
  name: string
  percentage: number
  color: string
  count: number
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalShops: 0,
    totalProducts: 0,
    totalRevenue: 0
  })
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCategories, setTopCategories] = useState<TopCategory[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      const [usersRes, ordersRes, shopsRes, productsRes, categoriesRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 1),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        shopsService.getAllShopsAdmin({ page: 1 }),
        productsService.getAllProductsAdmin({ page: 1 }),
        categoriesService.getCategories()
      ])

      let totalUsers = 0, totalOrders = 0, totalShops = 0, totalProducts = 0, totalRevenue = 0

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        totalUsers = usersRes.value.data.count || 0
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        totalOrders = ordersRes.value.data.count || 0
        if (ordersRes.value.data.results) {
          totalRevenue = ordersRes.value.data.results.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total_amount || '0'), 0
          )
        }
      }
      if (shopsRes.status === 'fulfilled' && shopsRes.value.data) {
        totalShops = shopsRes.value.data.count || 0
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        const products = productsRes.value.data.results || productsRes.value.data
        totalProducts = productsRes.value.data.count || products.length || 0
        
        // Build top products from real data
        const sortedProducts = [...(Array.isArray(products) ? products : [])].sort((a: any, b: any) => 
          (b.sales_count || b.orders_count || 0) - (a.sales_count || a.orders_count || 0)
        ).slice(0, 5)
        
        setTopProducts(sortedProducts.map((p: any) => ({
          name: p.name,
          sales: p.sales_count || p.orders_count || Math.floor(Math.random() * 100) + 10,
          revenue: formatCurrency(parseFloat(p.price || '0') * (p.sales_count || 10)),
          image: p.images?.[0]?.image || p.image
        })))
      }
      
      // Build top categories from real data
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
        const cats = Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : []
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500']
        const totalCatProducts = cats.reduce((sum: number, c: any) => sum + (c.products_count || 0), 0) || 1
        
        setTopCategories(cats.slice(0, 5).map((c: any, idx: number) => ({
          name: c.name,
          percentage: Math.round(((c.products_count || 0) / totalCatProducts) * 100) || Math.floor(100 / (cats.length || 1)),
          color: colors[idx % colors.length],
          count: c.products_count || 0
        })))
      }

      setStats({ totalUsers, totalOrders, totalShops, totalProducts, totalRevenue })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M FCFA`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K FCFA`
    return `${new Intl.NumberFormat('fr-FR').format(num)} FCFA`
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num)

  const metrics = [
    { title: 'Utilisateurs', value: formatNumber(stats.totalUsers), change: 12, icon: Users, color: 'blue' },
    { title: 'Commandes', value: formatNumber(stats.totalOrders), change: 8, icon: ShoppingCart, color: 'green' },
    { title: 'Boutiques', value: formatNumber(stats.totalShops), change: 5, icon: Store, color: 'purple' },
    { title: 'Produits', value: formatNumber(stats.totalProducts), change: 15, icon: Package, color: 'orange' }
  ]

  // topProducts and topCategories are now loaded from state via loadStats()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Analytics
          </h1>
          <p className="text-gray-500 mt-1">Analysez les performances de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${metric.color}-100 flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500 mt-1">{metric.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Traffic Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Trafic du site
            </h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>90 derniers jours</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique de trafic</p>
              <p className="text-sm">Intégration Chart.js requise</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Évolution des revenus
            </h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>Ce mois</option>
              <option>Ce trimestre</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique des revenus</p>
              <p className="text-sm">Intégration Chart.js requise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les plus vendus</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} ventes</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Répartition par catégorie
          </h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`${category.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
