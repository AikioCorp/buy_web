import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  DollarSign, Users, ShoppingBag, Store, Package,
  RefreshCw, Activity, Eye, ShoppingCart, Clock,
  CheckCircle, XCircle, BarChart3, Zap, Globe
} from 'lucide-react'
import { useDashboardCache } from '../../../hooks/useDashboardCache'
import { useAuthStore } from '../../../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  processing: { label: 'En cours', color: 'text-violet-600 bg-violet-50', icon: Activity },
  shipped: { label: 'Expédiée', color: 'text-indigo-600 bg-indigo-50', icon: ShoppingCart },
  delivered: { label: 'Livrée', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'text-red-600 bg-red-50', icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending']
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

function KpiCard({ title, value, sub, icon: Icon, gradient, loading }: {
  title: string; value: string; sub?: string; icon: any; gradient: string; loading: boolean
}) {
  return (
    <div className={`${gradient} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium opacity-90">{title}</span>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon size={18} />
          </div>
        </div>
        {loading ? (
          <div className="h-8 w-24 bg-white/20 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-black">{value}</p>
        )}
        {sub && <p className="text-xs mt-1.5 opacity-75">{sub}</p>}
      </div>
    </div>
  )
}

const SuperAdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data, loading, isDataStale, refreshStats, loadDashboardData } = useDashboardCache()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const stats = data?.stats || {
    totalUsers: 0, totalOrders: 0, totalShops: 0, totalProducts: 0,
    totalRevenue: 0, pendingOrders: 0, activeVendors: 0
  }
  const recentOrders = data?.recentOrders || []

  // Charger les analytics
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) { setAnalyticsLoading(false); return }
      const res = await fetch(`${API_BASE_URL}/api/analytics/summary?period=7d`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        setAnalyticsData(json.data || null)
      }
    } catch {
      // Analytics pas encore déployé — silencieux
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  useEffect(() => { loadAnalytics() }, [loadAnalytics])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshStats(), loadAnalytics()])
    setIsRefreshing(false)
  }

  const kpiVisitors = analyticsData?.kpis?.unique_visitors ?? '—'
  const kpiConversion = analyticsData?.kpis?.conversion_rate ?? '—'
  const kpiProductViews = analyticsData?.kpis?.product_views ?? '—'
  const topProducts = analyticsData?.top_products || []
  const topSearches = analyticsData?.top_searches || []

  // Distribution commandes pour le petit graphique
  const statusCounts = Object.entries(STATUS_CONFIG).map(([k, v]) => ({
    key: k, label: v.label,
    count: recentOrders.filter((o: any) => o.status === k).length,
    color: k === 'pending' ? '#f59e0b' : k === 'delivered' ? '#10b981' : k === 'cancelled' ? '#ef4444' : k === 'confirmed' ? '#3b82f6' : '#8b5cf6'
  })).filter(d => d.count > 0)
  const maxStatusCount = Math.max(...statusCounts.map(s => s.count), 1)

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Bonjour, {user?.first_name || 'Super Admin'} 👑
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Vue globale de la plateforme BuyMore
            {isDataStale && <span className="ml-2 text-amber-500 text-xs">⚠️ Cache expiré</span>}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm shadow-sm">
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Sync...' : 'Actualiser'}
        </button>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Revenu Récent" value={`${formatCurrency(stats.totalRevenue)} F`}
          sub={`sur ${stats.totalOrders} commandes`}
          icon={DollarSign} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" loading={loading} />
        <KpiCard title="Utilisateurs" value={stats.totalUsers.toLocaleString()}
          sub={`dont ${stats.activeVendors} vendeurs`}
          icon={Users} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" loading={loading} />
        <KpiCard title="Boutiques" value={stats.totalShops.toLocaleString()}
          sub={`${stats.totalProducts} produits`}
          icon={Store} gradient="bg-gradient-to-br from-purple-500 to-violet-600" loading={loading} />
        <KpiCard title="En Attente" value={stats.pendingOrders.toString()}
          sub="commandes à traiter"
          icon={Clock} gradient="bg-gradient-to-br from-amber-500 to-orange-600" loading={loading} />
      </div>

      {/* ─── Analytics KPIs ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Visiteurs Uniques', value: typeof kpiVisitors === 'number' ? kpiVisitors.toLocaleString() : kpiVisitors, icon: Globe, color: 'bg-sky-50 text-sky-700 border-sky-200' },
          { label: 'Vues Produits', value: typeof kpiProductViews === 'number' ? kpiProductViews.toLocaleString() : kpiProductViews, icon: Eye, color: 'bg-violet-50 text-violet-700 border-violet-200' },
          { label: 'Taux Conversion', value: typeof kpiConversion === 'number' ? `${kpiConversion}%` : kpiConversion, icon: Zap, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-xl border p-4 flex items-center gap-4 ${kpi.color}`}>
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
              <kpi.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium opacity-75">{kpi.label}</p>
              {analyticsLoading ? (
                <div className="h-6 w-16 bg-current opacity-20 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-black">{kpi.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes récentes & Status chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribution des statuts */}
          {statusCounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" />
                Distribution des commandes
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
                <ShoppingCart size={18} className="text-purple-600" />
                Commandes Récentes
              </h2>
              <Link to="/superadmin/orders" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune commande récente</p>
                </div>
              ) : (
                recentOrders.map((order: any, idx: number) => (
                  <button key={order.id || idx}
                    onClick={() => navigate(`/superadmin/orders`)}
                    className="w-full p-4 flex items-center justify-between hover:bg-indigo-50/50 transition-colors text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {String(order.id || idx + 1).slice(-2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          #{order.order_number || order.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.username || order.customer_name || 'Client'}
                        </p>
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
        <div className="space-y-6">
          {/* Top produits vus */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={16} className="text-sky-600" />
              Top Produits Vus
            </h3>
            {analyticsLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
              ))}</div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.slice(0, 5).map((p: any, i: number) => (
                  <div key={p.product_id || i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-800 truncate">{p.product_name}</span>
                    <span className="text-xs font-semibold text-indigo-600">{p.view_count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">Données insuffisantes</p>
            )}
          </div>

          {/* Top recherches */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-600" />
              Top Recherches
            </h3>
            {analyticsLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
              ))}</div>
            ) : topSearches.length > 0 ? (
              <div className="space-y-2">
                {topSearches.slice(0, 5).map((s: any, i: number) => (
                  <div key={s.query || i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate max-w-[150px]">"{s.query}"</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">{s.count}×</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">Données insuffisantes</p>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-3">Accès Rapide</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/superadmin/users', icon: Users, label: 'Utilisateurs' },
                { to: '/superadmin/orders', icon: ShoppingCart, label: 'Commandes' },
                { to: '/superadmin/businesses', icon: Store, label: 'Boutiques' },
                { to: '/superadmin/products', icon: Package, label: 'Produits' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center gap-1 transition-colors">
                  <item.icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
