import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, ShoppingBag, Store, DollarSign,
  AlertTriangle, ShoppingCart, CheckCircle, Clock, XCircle,
  BarChart3, Activity, Shield, RefreshCw, Zap, Loader2, Package
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { useDashboardCache } from '../../../hooks/useDashboardCache'

const STATUS_CONFIG: Record<string, { label: string; bg: string; icon: any }> = {
  pending: { label: 'En attente', bg: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: 'Confirmée', bg: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'En cours', bg: 'bg-violet-100 text-violet-700', icon: Activity },
  shipped: { label: 'Expédiée', bg: 'bg-indigo-100 text-indigo-700', icon: ShoppingCart },
  delivered: { label: 'Livrée', bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Annulée', bg: 'bg-red-100 text-red-700', icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending']
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

/**
 * Admin Dashboard — utilise le cache partagé useDashboardCache
 * pour éviter de refetcher les données quand on navigue entre admin/superadmin.
 */
const AdminDashboardPage: React.FC = () => {
  const { user, role } = useAuthStore()
  const navigate = useNavigate()
  const isSuperAdmin = role === 'super_admin'

  // Cache partagé avec SuperAdminDashboardPage
  const { data, loading, error, isDataStale, refreshStats, loadDashboardData } = useDashboardCache()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const stats = data?.stats || {
    totalUsers: 0, totalOrders: 0, totalShops: 0, totalProducts: 0,
    totalRevenue: 0, pendingOrders: 0, activeVendors: 0
  }
  const recentOrders = data?.recentOrders || []

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshStats()
    setIsRefreshing(false)
  }

  // Bar chart data (CSS simple)
  const statusCounts = Object.entries(STATUS_CONFIG).map(([k, v]) => ({
    key: k, label: v.label,
    count: recentOrders.filter((o: any) => o.status === k).length,
    color: k === 'pending' ? '#f59e0b' : k === 'delivered' ? '#10b981' : k === 'cancelled' ? '#ef4444' : k === 'confirmed' ? '#3b82f6' : '#8b5cf6'
  })).filter(d => d.count > 0)
  const maxStatusCount = Math.max(...statusCounts.map(s => s.count), 1)

  // Determiner les basePaths selon le rôle
  const basePath = isSuperAdmin ? '/superadmin' : '/admin'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => loadDashboardData(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm">
            <RefreshCw size={16} />Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Bonjour, {user?.first_name || user?.username || 'Admin'} {isSuperAdmin ? '👑' : '🛡️'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isSuperAdmin ? 'Vue complète de la plateforme' : 'Tableau de bord modération & gestion'}
            {isDataStale && <span className="ml-2 text-amber-500 text-xs">⚠️ Cache expiré</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {isSuperAdmin ? '👑 Super Admin' : '🛡️ Admin'}
          </span>
          <button onClick={handleRefresh} disabled={isRefreshing}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Permissions banner ─── */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">Vos accès</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">👥 Utilisateurs</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">🏪 Boutiques</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">📦 Produits</span>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">🛒 Commandes</span>
            {isSuperAdmin && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">⚙️ Configuration</span>}
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-100">Utilisateurs</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Users size={16} /></div>
            </div>
            <p className="text-3xl font-black">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-blue-200 mt-1">{stats.activeVendors} vendeurs actifs</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-emerald-100">Commandes</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><ShoppingCart size={16} /></div>
            </div>
            <p className="text-3xl font-black">{stats.totalOrders.toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-1">{stats.pendingOrders} en attente</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-200 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-100">Boutiques</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Store size={16} /></div>
            </div>
            <p className="text-3xl font-black">{stats.totalShops.toLocaleString()}</p>
            <p className="text-xs text-purple-200 mt-1">{stats.totalProducts} produits</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-amber-100">Revenu</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><DollarSign size={16} /></div>
            </div>
            <p className="text-3xl font-black">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-amber-200 mt-1">FCFA (récent)</p>
          </div>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders + Status Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribution */}
          {statusCounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" />
                Statuts des commandes
              </h2>
              <div className="space-y-2">
                {statusCounts.map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-2"
                        style={{ width: `${Math.max((item.count / maxStatusCount) * 100, 15)}%`, backgroundColor: item.color }}>
                        <span className="text-[10px] text-white font-bold">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commandes récentes - CLIQUABLES */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-600" />
                Commandes Récentes
              </h2>
              <Link to={`${basePath}/orders`}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune commande récente</p>
                </div>
              ) : (
                recentOrders.slice(0, 6).map((order: any, idx: number) => (
                  <button key={order.id || idx}
                    onClick={() => navigate(`${basePath}/orders`)}
                    className="w-full p-4 flex items-center justify-between hover:bg-emerald-50/50 transition-colors text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-xs">
                        {String(order.id || idx + 1).slice(-2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">#{order.order_number || order.id}</p>
                        <p className="text-xs text-gray-500">{order.user?.username || order.customer_name || 'Client'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {parseFloat(order.total_amount || '0').toLocaleString('fr-FR')} F
                      </p>
                      <StatusBadge status={order.status || 'pending'} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions rapides */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-amber-600" />Actions Rapides
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to={`${basePath}/users`} className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors group">
                <Users size={22} className="mx-auto text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-blue-700">Utilisateurs</span>
              </Link>
              <Link to={`${basePath}/moderation`} className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-center transition-colors group">
                <AlertTriangle size={22} className="mx-auto text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-orange-700">Modération</span>
              </Link>
              <Link to={`${basePath}/orders`} className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-center transition-colors group">
                <ShoppingCart size={22} className="mx-auto text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-emerald-700">Commandes</span>
              </Link>
              <Link to={`${basePath}/products`} className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors group">
                <Package size={22} className="mx-auto text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-purple-700">Produits</span>
              </Link>
            </div>
          </div>

          {/* SuperAdmin only */}
          {isSuperAdmin && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <BarChart3 size={16} />Super Admin
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { to: '/superadmin/categories', label: 'Catégories', icon: BarChart3 },
                  { to: '/superadmin/analytics', label: 'Analytics', icon: Activity },
                  { to: '/superadmin/businesses', label: 'Boutiques', icon: Store },
                  { to: '/superadmin/revenue', label: 'Revenus', icon: DollarSign },
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center gap-1 transition-colors">
                    <item.icon size={18} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
