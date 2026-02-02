import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, ShoppingBag, Store, Package, TrendingUp, DollarSign,
  AlertTriangle, Flag, Eye, ArrowRight, Loader2, ShoppingCart,
  CheckCircle, Clock, XCircle, BarChart3, Activity, Shield, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { usersService } from '../../../lib/api/usersService'
import { ordersService } from '../../../lib/api/ordersService'
import { shopsService } from '../../../lib/api/shopsService'
import { productsService } from '../../../lib/api/productsService'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalShops: number
  totalProducts: number
  totalRevenue: number
  pendingOrders: number
  activeVendors: number
  newUsersToday: number
}

// Default permissions for admin (can be overridden by user.permissions from API)
const DEFAULT_ADMIN_PERMISSIONS = [
  'users_view', 'shops_view', 'products_view', 'orders_view'
]

const AdminDashboardPage: React.FC = () => {
  const { user, role } = useAuthStore()
  const isSuperAdmin = role === 'super_admin'
  
  // Get user permissions - SuperAdmin has all, Admin has limited based on their permissions
  const userPermissions = useMemo(() => {
    if (isSuperAdmin) {
      // SuperAdmin has all permissions
      return [
        'users_view', 'users_edit', 'users_delete', 'users_create',
        'shops_view', 'shops_validate', 'shops_edit', 'shops_delete',
        'products_view', 'products_edit', 'products_delete', 'products_moderate',
        'orders_view', 'orders_manage', 'orders_cancel',
        'settings_view', 'settings_edit'
      ]
    }
    // Admin uses their specific permissions or defaults
    return user?.permissions || DEFAULT_ADMIN_PERMISSIONS
  }, [isSuperAdmin, user?.permissions])

  // Permission check helper
  const hasPermission = (permission: string) => userPermissions.includes(permission)
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalShops: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeVendors: 0,
    newUsersToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [topShops, setTopShops] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [userPermissions])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Only fetch data for sections the user has permission to view
      const promises: Promise<any>[] = []
      const promiseKeys: string[] = []

      if (hasPermission('users_view')) {
        promises.push(usersService.getAllUsers(1, 10))
        promiseKeys.push('users')
      }
      if (hasPermission('orders_view')) {
        promises.push(ordersService.getAllOrdersAdmin({ page: 1 }))
        promiseKeys.push('orders')
      }
      if (hasPermission('shops_view')) {
        promises.push(shopsService.getAllShopsAdmin({ page: 1 }))
        promiseKeys.push('shops')
      }
      if (hasPermission('products_view')) {
        promises.push(productsService.getAllProductsAdmin({ page: 1 }))
        promiseKeys.push('products')
      }

      const results = await Promise.allSettled(promises)

      let totalUsers = 0
      let totalOrders = 0
      let totalShops = 0
      let totalProducts = 0
      let totalRevenue = 0
      let pendingOrders = 0
      let activeVendors = 0

      results.forEach((result, index) => {
        const key = promiseKeys[index]
        if (result.status === 'fulfilled' && result.value?.data) {
          const data = result.value.data

          switch (key) {
            case 'users':
              totalUsers = data.count || (Array.isArray(data) ? data.length : 0)
              const usersArray = data.results || (Array.isArray(data) ? data : [])
              activeVendors = usersArray.filter((u: any) => u.is_seller && u.is_active !== false).length
              setRecentUsers(usersArray.slice(0, 5))
              break

            case 'orders':
              totalOrders = data.count || (Array.isArray(data) ? data.length : 0)
              const ordersArray = data.results || (Array.isArray(data) ? data : [])
              totalRevenue = ordersArray.reduce((sum: number, order: any) => 
                sum + parseFloat(order.total_amount || order.total || '0'), 0
              )
              pendingOrders = ordersArray.filter((o: any) => 
                o.status === 'pending' || o.status === 'en_attente'
              ).length
              setRecentOrders(ordersArray.slice(0, 5))
              break

            case 'shops':
              totalShops = data.count || (Array.isArray(data) ? data.length : 0)
              const shopsArray = data.results || (Array.isArray(data) ? data : [])
              setTopShops(shopsArray.slice(0, 5))
              break

            case 'products':
              totalProducts = data.count || (Array.isArray(data) ? data.length : 0)
              break
          }
        }
      })

      setStats({
        totalUsers,
        totalOrders,
        totalShops,
        totalProducts,
        totalRevenue,
        pendingOrders,
        activeVendors,
        newUsersToday: 0 // Will be calculated from API if available
      })
    } catch (err: any) {
      console.error('Erreur chargement dashboard:', err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'en_attente': 'En attente',
      'processing': 'En cours',
      'en_cours': 'En cours',
      'completed': 'Terminée',
      'terminee': 'Terminée',
      'cancelled': 'Annulée',
      'annulee': 'Annulée',
      'delivered': 'Livrée',
      'livree': 'Livrée'
    }
    const configs: Record<string, { bg: string, text: string, icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Activity },
      en_cours: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Activity },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      terminee: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      annulee: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
      livree: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle }
    }
    const normalizedStatus = status?.toLowerCase() || 'pending'
    const config = configs[normalizedStatus] || configs.pending
    const Icon = config.icon
    const label = statusMap[normalizedStatus] || status
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bonjour, {user?.first_name || user?.username || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {isSuperAdmin ? 'Vue complète de la plateforme' : 'Gérez et modérez la plateforme'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isSuperAdmin ? '👑 Super Admin' : '🛡️ Admin'}
          </span>
        </div>
      </div>

      {/* Permissions Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-indigo-900">Vos permissions</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {hasPermission('users_view') && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">👥 Utilisateurs</span>
              )}
              {hasPermission('shops_view') && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">🏪 Boutiques</span>
              )}
              {hasPermission('products_view') && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">📦 Produits</span>
              )}
              {hasPermission('orders_view') && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">🛒 Commandes</span>
              )}
              {isSuperAdmin && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">⚙️ Paramètres</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Only show cards for permissions the user has */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {hasPermission('users_view') && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-blue-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Utilisateurs</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-blue-200 text-xs mt-1">{stats.activeVendors} vendeurs</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
          </div>
        )}

        {hasPermission('orders_view') && (
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-emerald-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Commandes</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalOrders.toLocaleString()}</p>
                <p className="text-emerald-200 text-xs mt-1">{stats.pendingOrders} en attente</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingCart size={24} />
              </div>
            </div>
          </div>
        )}

        {hasPermission('shops_view') && (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-purple-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Boutiques</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalShops.toLocaleString()}</p>
                <p className="text-purple-200 text-xs mt-1">Enregistrées</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Store size={24} />
              </div>
            </div>
          </div>
        )}

        {hasPermission('products_view') && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-amber-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Produits</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalProducts.toLocaleString()}</p>
                <p className="text-amber-200 text-xs mt-1">En catalogue</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Card - Only for SuperAdmin */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-green-100 text-sm flex items-center gap-2">
                <DollarSign size={16} />
                Revenu Total
              </p>
              <p className="text-4xl font-black mt-2">{formatCurrency(stats.totalRevenue)} FCFA</p>
              <p className="text-green-200 text-sm mt-1">
                <TrendingUp size={14} className="inline mr-1" />
                Basé sur les commandes récentes
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/superadmin/analytics"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <BarChart3 size={18} />
                Voir Analytics
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Only show if user has orders_view permission */}
        {hasPermission('orders_view') ? (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={20} className="text-emerald-600" />
                Commandes Récentes
              </h2>
              <Link 
                to={isSuperAdmin ? "/superadmin/orders" : "/admin/reports"}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>Aucune commande récente</p>
                </div>
              ) : (
                recentOrders.map((order, idx) => (
                  <div key={order.id || idx} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ShoppingCart size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Commande #{order.id || order.order_number || idx + 1}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.username || order.customer_name || order.customer?.username || 'Client'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {parseFloat(order.total_amount || order.total || 0).toLocaleString()} FCFA
                        </p>
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Accès restreint</p>
              <p className="text-sm mt-1">Vous n'avez pas la permission de voir les commandes</p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions - Show based on permissions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {hasPermission('users_view') && (
                <Link 
                  to="/admin/users"
                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors"
                >
                  <Users size={24} className="mx-auto text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-blue-700">Utilisateurs</span>
                </Link>
              )}
              {hasPermission('products_moderate') && (
                <Link 
                  to="/admin/moderation"
                  className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-center transition-colors"
                >
                  <Flag size={24} className="mx-auto text-orange-600 mb-1" />
                  <span className="text-xs font-medium text-orange-700">Modération</span>
                </Link>
              )}
              <Link 
                to="/admin/reports"
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors"
              >
                <AlertTriangle size={24} className="mx-auto text-purple-600 mb-1" />
                <span className="text-xs font-medium text-purple-700">Rapports</span>
              </Link>
              <Link 
                to="/admin/analytics"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-center transition-colors"
              >
                <BarChart3 size={24} className="mx-auto text-emerald-600 mb-1" />
                <span className="text-xs font-medium text-emerald-700">Analytics</span>
              </Link>
            </div>
          </div>

          {/* Top Shops - Only show if user has shops_view permission */}
          {hasPermission('shops_view') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Store size={18} className="text-purple-600" />
                Boutiques Actives
              </h3>
              <div className="space-y-3">
                {topShops.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune boutique</p>
                ) : (
                  topShops.slice(0, 4).map((shop, idx) => (
                    <div key={shop.id || idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 truncate max-w-[120px]">
                            {shop.name || shop.store_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {shop.products_count || 0} produits
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        shop.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {shop.is_active !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {(isSuperAdmin || hasPermission('shops_edit')) && (
                <Link 
                  to={isSuperAdmin ? "/superadmin/businesses" : "/admin/moderation"}
                  className="mt-4 block text-center text-sm text-purple-600 hover:text-purple-700"
                >
                  Gérer les boutiques →
                </Link>
              )}
            </div>
          )}

          {/* Recent Users - Only show if user has users_view permission */}
          {hasPermission('users_view') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Nouveaux Utilisateurs
              </h3>
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucun utilisateur</p>
                ) : (
                  recentUsers.slice(0, 4).map((usr, idx) => (
                    <div key={usr.id || idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {(usr.first_name?.[0] || usr.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {usr.first_name ? `${usr.first_name} ${usr.last_name || ''}` : usr.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{usr.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        usr.is_seller ? 'bg-purple-100 text-purple-700' : 
                        usr.is_staff ? 'bg-orange-100 text-orange-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {usr.is_seller ? 'Vendeur' : usr.is_staff ? 'Staff' : 'Client'}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Link 
                to="/admin/users"
                className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
              >
                Voir tous les utilisateurs →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* SuperAdmin Only Section */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">🚀 Accès Super Admin</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link 
              to="/superadmin/products"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-center transition-colors"
            >
              <Package size={28} className="mx-auto mb-2" />
              <span className="text-sm font-medium">Produits</span>
            </Link>
            <Link 
              to="/superadmin/categories"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-center transition-colors"
            >
              <BarChart3 size={28} className="mx-auto mb-2" />
              <span className="text-sm font-medium">Catégories</span>
            </Link>
            <Link 
              to="/superadmin/performance"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-center transition-colors"
            >
              <TrendingUp size={28} className="mx-auto mb-2" />
              <span className="text-sm font-medium">Performance</span>
            </Link>
            <Link 
              to="/superadmin/security"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-center transition-colors"
            >
              <Eye size={28} className="mx-auto mb-2" />
              <span className="text-sm font-medium">Sécurité</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
