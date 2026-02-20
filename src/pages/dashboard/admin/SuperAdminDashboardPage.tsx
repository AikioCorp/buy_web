import React, { useState } from 'react'
import {
  TrendingUp, DollarSign, Users, ShoppingBag, Store, Package,
  Settings, Download, Activity, ArrowUp, RefreshCw
} from 'lucide-react'
import { useDashboardCache } from '../../../hooks/useDashboardCache'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalShops: number
  totalProducts: number
  totalRevenue: number
  pendingOrders: number
  activeVendors: number
}

const MetricCard = ({ title, value, change, icon, color, loading }: any) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{loading ? '...' : value}</h3>
        <div className={`text-sm font-medium mt-2 flex items-center gap-1 ${change?.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
          {change?.startsWith('+') && <ArrowUp size={14} />}
          {change || ''}
        </div>
      </div>
      <div className="p-3 rounded-lg" style={{ background: color }}>{icon}</div>
    </div>
  </div>
)

const SuperAdminDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Utiliser le hook de cache
  const { data, loading, error, loadDashboardData, refreshStats, isDataStale } = useDashboardCache()
  
  const stats = data?.stats || {
    totalUsers: 0,
    totalOrders: 0,
    totalShops: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeVendors: 0
  }
  
  const recentOrders = data?.recentOrders || []
  
  // Rafraîchir rapidement les stats sans recharger la page
  const handleQuickRefresh = async () => {
    setIsRefreshing(true)
    await refreshStats()
    setIsRefreshing(false)
  }
  
  // Forcer un rechargement complet
  const handleFullRefresh = async () => {
    await loadDashboardData(true)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toString()
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Super Admin</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600">Vue complète de la plateforme et analytiques globales</p>
            {data && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDataStale ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {isDataStale ? '⚠️ Cache expiré' : '✓ Cache actif'}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <button 
            onClick={handleQuickRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Rafraîchir les statistiques"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-8 flex gap-2">
        {(['day', 'week', 'month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
          </button>
        ))}
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Revenu Total"
          value={`${formatCurrency(stats.totalRevenue)} FCFA`}
          change="+24% vs dernière période"
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-green-500"
          loading={loading}
        />
        <MetricCard
          title="Total Utilisateurs"
          value={stats.totalUsers.toLocaleString()}
          change="+8.2% croissance"
          icon={<Users size={24} className="text-white" />}
          color="bg-blue-500"
          loading={loading}
        />
        <MetricCard
          title="Nombre Commandes"
          value={stats.totalOrders.toLocaleString()}
          change={`${stats.pendingOrders} en attente`}
          icon={<ShoppingBag size={24} className="text-white" />}
          color="bg-purple-500"
          loading={loading}
        />
        <MetricCard
          title="Boutiques"
          value={stats.totalShops.toLocaleString()}
          change={`${stats.totalProducts} produits`}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Évolution du Revenu</h2>
          <div className="h-64 flex items-end justify-between gap-2 p-4">
            {[4200, 3800, 4500, 5200, 4700, 5500, 5900, 6200, 6100, 6800, 7100, 7500].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition-all cursor-pointer relative group"
                  style={{ height: `${(value / 8000) * 240}px` }}
                >
                  <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {(value / 1000).toFixed(1)}k
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">M{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution Pie */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Distribution Utilisateurs</h2>
          <div className="space-y-4">
            {[
              { label: 'Clients', value: 35420, percent: 78 },
              { label: 'Vendeurs', value: 8230, percent: 18 },
              { label: 'Admins', value: 580, percent: 4 }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-sm text-gray-600">{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-orange-500'][idx]}`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Shops */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top 10 Boutiques</h2>
          <div className="space-y-3">
            {[
              { name: 'Samsung Shop', revenue: '8.5M XOF', orders: 2345, rating: 4.9 },
              { name: 'Electronics Hub', revenue: '7.2M XOF', orders: 1876, rating: 4.8 },
              { name: 'Tech Store', revenue: '6.8M XOF', orders: 1654, rating: 4.7 },
              { name: 'Mobile Paradise', revenue: '5.4M XOF', orders: 1342, rating: 4.6 },
              { name: 'Digital World', revenue: '4.9M XOF', orders: 1125, rating: 4.5 }
            ].map((shop, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{shop.name}</p>
                    <p className="text-xs text-gray-500">{shop.orders} commandes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-sm">{shop.revenue}</p>
                  <p className="text-xs text-gray-500">⭐ {shop.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Santé du Système</h2>
          <div className="space-y-4">
            {[
              { name: 'Serveur Principal', status: 'healthy', usage: 45 },
              { name: 'Base de Données', status: 'healthy', usage: 62 },
              { name: 'Stockage', status: 'healthy', usage: 78 },
              { name: 'Cache Redis', status: 'healthy', usage: 38 },
              { name: 'CDN', status: 'warning', usage: 92 }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    item.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status === 'healthy' ? '✓ OK' : '⚠ Alerte'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.usage > 80 ? 'bg-red-500' : item.usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.usage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.usage}% d'utilisation</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Transactions Récentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Txn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { id: 'TXN-001', amount: '125,000 XOF', status: 'completed', method: 'Orange Money', date: 'Il y a 2 min' },
                { id: 'TXN-002', amount: '85,500 XOF', status: 'completed', method: 'Wave', date: 'Il y a 5 min' },
                { id: 'TXN-003', amount: '250,000 XOF', status: 'pending', method: 'Bank Transfer', date: 'Il y a 15 min' },
                { id: 'TXN-004', amount: '45,200 XOF', status: 'completed', method: 'Card', date: 'Il y a 1 heure' },
              ].map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{txn.amount}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {txn.status === 'completed' ? 'Complétée' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Configuration Système</h2>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Version Plateforme', value: 'v2.4.1' },
            { label: 'Base de Données', value: 'PostgreSQL 15.2' },
            { label: 'Dernière Sauvegarde\', value: \'Aujourd\'hui à 02:30 AM' },
            { label: 'Uptime', value: '99.98%' },
            { label: 'Utilisateurs Connectés', value: '3,245' },
            { label: 'Requêtes/min', value: '12,543' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{item.label}</p>
              <p className="font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
