import { useState, useEffect } from 'react'
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Users, Store, Filter, RefreshCw,
  BarChart3, PieChart, LineChart, Loader2
} from 'lucide-react'
import { usersService } from '../../../lib/api/usersService'
import { ordersService } from '../../../lib/api/ordersService'
import { shopsService } from '../../../lib/api/shopsService'
import { useToast } from '../../../components/Toast'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalShops: number
}

export default function AdminReportsPage() {
  const { showToast } = useToast()
  const [dateRange, setDateRange] = useState('month')
  const [reportType, setReportType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalShops: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [usersRes, ordersRes, shopsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 1),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        shopsService.getAllShopsAdmin({ page: 1 })
      ])

      let totalUsers = 0, totalOrders = 0, totalShops = 0, totalRevenue = 0

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

      setStats({ totalRevenue, totalOrders, totalUsers, totalShops })
    } catch (err) {
      showToast('Erreur lors du chargement', 'error')
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
    { title: 'Revenus totaux', value: formatCurrency(stats.totalRevenue), change: 12.5, icon: DollarSign, color: 'green' },
    { title: 'Commandes', value: formatNumber(stats.totalOrders), change: 8.3, icon: ShoppingCart, color: 'blue' },
    { title: 'Utilisateurs', value: formatNumber(stats.totalUsers), change: 5.2, icon: Users, color: 'purple' },
    { title: 'Boutiques', value: formatNumber(stats.totalShops), change: 15.7, icon: Store, color: 'orange' }
  ]

  const recentReports = [
    { id: 1, name: `Rapport mensuel - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, type: 'Ventes', date: new Date().toISOString(), status: 'completed' },
    { id: 2, name: 'Analyse des performances vendeurs', type: 'Performance', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    { id: 3, name: 'Rapport de trafic utilisateurs', type: 'Trafic', date: new Date(Date.now() - 172800000).toISOString(), status: 'pending' },
    { id: 4, name: 'Analyse des catégories populaires', type: 'Produits', date: new Date(Date.now() - 259200000).toISOString(), status: 'completed' }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Rapports et Analyses
          </h1>
          <p className="text-gray-500 mt-1">Consultez les statistiques et générez des rapports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Générer un rapport
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {reportSummaries.map((summary, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${summary.color}-100 flex items-center justify-center`}>
                <summary.icon className={`w-6 h-6 text-${summary.color}-600`} />
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              Évolution des revenus
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Voir détails</button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique des revenus</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Répartition des commandes
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Voir détails</button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique circulaire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rapports récents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports.map((report) => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
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
