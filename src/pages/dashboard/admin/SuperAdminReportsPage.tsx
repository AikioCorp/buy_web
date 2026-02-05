import { useState, useEffect } from 'react'
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Users, Store, Filter, RefreshCw,
  BarChart3, PieChart, LineChart, Loader2, Package, Star
} from 'lucide-react'
import { usersService } from '../../../lib/api/usersService'
import { ordersService } from '../../../lib/api/ordersService'
import { shopsService } from '../../../lib/api/shopsService'
import { productsService } from '../../../lib/api/productsService'
import { useToast } from '../../../components/Toast'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalShops: number
  totalProducts: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
}

export default function SuperAdminReportsPage() {
  const { showToast } = useToast()
  const [dateRange, setDateRange] = useState('month')
  const [reportType, setReportType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [usersRes, ordersRes, shopsRes, productsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 1),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        shopsService.getAllShopsAdmin({ page: 1 }),
        productsService.getAllProductsAdmin({ page: 1 })
      ])

      let totalUsers = 0, totalOrders = 0, totalShops = 0, totalRevenue = 0, totalProducts = 0
      let pendingOrders = 0, completedOrders = 0, cancelledOrders = 0

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        totalUsers = usersRes.value.data.count || (Array.isArray(usersRes.value.data) ? usersRes.value.data.length : 0)
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const ordersData = (ordersRes.value.data as any).data || ordersRes.value.data
        totalOrders = ordersData.count || (ordersData.results?.length || 0)
        if (ordersData.results) {
          totalRevenue = ordersData.results.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total_amount || '0'), 0
          )
          pendingOrders = ordersData.results.filter((o: any) => o.status === 'pending').length
          completedOrders = ordersData.results.filter((o: any) => o.status === 'delivered').length
          cancelledOrders = ordersData.results.filter((o: any) => o.status === 'cancelled').length
        }
      }
      if (shopsRes.status === 'fulfilled' && shopsRes.value.data) {
        totalShops = shopsRes.value.data.count || (Array.isArray(shopsRes.value.data) ? shopsRes.value.data.length : 0)
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        totalProducts = productsRes.value.data.count || (Array.isArray(productsRes.value.data) ? productsRes.value.data.length : 0)
      }

      setStats({ totalRevenue, totalOrders, totalUsers, totalShops, totalProducts, pendingOrders, completedOrders, cancelledOrders })
    } catch (err) {
      showToast('Erreur lors du chargement des statistiques', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num)
  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M FCFA`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K FCFA`
    return `${formatNumber(num)} FCFA`
  }

  const reportSummaries = [
    { title: 'Revenus totaux', value: formatCurrency(stats.totalRevenue), change: 12.5, icon: DollarSign, bgColor: 'bg-green-500', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { title: 'Commandes', value: formatNumber(stats.totalOrders), change: 8.3, icon: ShoppingCart, bgColor: 'bg-blue-500', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Utilisateurs', value: formatNumber(stats.totalUsers), change: 5.2, icon: Users, bgColor: 'bg-purple-500', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { title: 'Boutiques', value: formatNumber(stats.totalShops), change: 15.7, icon: Store, bgColor: 'bg-orange-500', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
    { title: 'Produits', value: formatNumber(stats.totalProducts), change: 3.8, icon: Package, bgColor: 'bg-indigo-500', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' }
  ]

  const orderStats = [
    { label: 'En attente', value: stats.pendingOrders, color: 'bg-yellow-500' },
    { label: 'Livrées', value: stats.completedOrders, color: 'bg-green-500' },
    { label: 'Annulées', value: stats.cancelledOrders, color: 'bg-red-500' }
  ]

  const recentReports = [
    { id: 1, name: `Rapport mensuel - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, type: 'Ventes', date: new Date().toISOString(), status: 'completed' },
    { id: 2, name: 'Analyse des performances vendeurs', type: 'Performance', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    { id: 3, name: 'Rapport de trafic utilisateurs', type: 'Trafic', date: new Date(Date.now() - 172800000).toISOString(), status: 'pending' },
    { id: 4, name: 'Analyse des catégories populaires', type: 'Produits', date: new Date(Date.now() - 259200000).toISOString(), status: 'completed' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Rapports et Analyses
          </h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble des performances de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-500/25">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
              <option value="all">Tout</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
            >
              <option value="all">Tous les types</option>
              <option value="sales">Ventes</option>
              <option value="traffic">Trafic</option>
              <option value="performance">Performance</option>
              <option value="products">Produits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {reportSummaries.map((summary, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${summary.iconBg} flex items-center justify-center`}>
                <summary.icon className={`w-6 h-6 ${summary.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                summary.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(summary.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.value}</p>
            <p className="text-sm text-gray-500 mt-1">{summary.title}</p>
          </div>
        ))}
      </div>

      {/* Order Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des commandes</h3>
        <div className="grid grid-cols-3 gap-4">
          {orderStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${stat.color} bg-opacity-20 flex items-center justify-center mb-2`}>
                <span className={`text-2xl font-bold ${stat.color.replace('bg-', 'text-')}`}>{stat.value}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              Évolution des revenus
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Voir détails</button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Graphique des revenus</p>
              <p className="text-sm">Total: {formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Répartition des commandes
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Voir détails</button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Graphique circulaire</p>
              <p className="text-sm">Total: {stats.totalOrders} commandes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Rapports récents</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentReports.map((report) => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-500">{report.type} • {new Date(report.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  report.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {report.status === 'completed' ? 'Terminé' : 'En cours'}
                </span>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
