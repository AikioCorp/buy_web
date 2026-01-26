import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, ShoppingBag, Store, Package,
  DollarSign, Calendar, ArrowUp, ArrowDown, Eye, ShoppingCart
} from 'lucide-react'
import { usersService } from '../../../lib/api/usersService'
import { ordersService } from '../../../lib/api/ordersService'
import { shopsService } from '../../../lib/api/shopsService'
import { productsService } from '../../../lib/api/productsService'

interface Stats {
  totalUsers: number
  totalOrders: number
  totalShops: number
  totalProducts: number
  totalRevenue: number
}

const SuperAdminAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalShops: 0,
    totalProducts: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Charger les statistiques depuis les APIs
      const [usersRes, ordersRes, shopsRes, productsRes] = await Promise.allSettled([
        usersService.getAllUsers(1, 1),
        ordersService.getAllOrdersAdmin({ page: 1 }),
        shopsService.getAllShopsAdmin({ page: 1 }),
        productsService.getAllProductsAdmin({ page: 1 })
      ])

      let totalUsers = 0
      let totalOrders = 0
      let totalShops = 0
      let totalProducts = 0
      let totalRevenue = 0

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        totalUsers = usersRes.value.data.count || 0
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const ordersData = ordersRes.value.data
        totalOrders = ordersData.count || 0
        // Calculer le revenu total
        if (ordersData.results) {
          totalRevenue = ordersData.results.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total_amount || '0'), 0
          )
        }
      }

      if (shopsRes.status === 'fulfilled' && shopsRes.value.data) {
        totalShops = shopsRes.value.data.count || 0
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        totalProducts = productsRes.value.data.count || 0
      }

      setStats({
        totalUsers,
        totalOrders,
        totalShops,
        totalProducts,
        totalRevenue
      })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  // Données simulées pour les graphiques (à remplacer par des données réelles)
  const revenueData = {
    week: [420000, 380000, 410000, 520000, 470000, 530000, 490000],
    month: [1200000, 1500000, 1400000, 1800000, 1600000, 1900000, 1700000, 1850000, 1920000, 1800000, 2000000, 2150000],
    year: [4500000, 5200000, 4800000, 6500000, 7200000, 7500000, 7800000, 8200000, 8500000, 8800000, 9000000, 9500000]
  }

  const currentData = revenueData[period]
  const maxValue = Math.max(...currentData)

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytiques</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble des performances de la plateforme</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.totalUsers)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <ArrowUp size={14} />
                <span>+12% ce mois</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Commandes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.totalOrders)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <ArrowUp size={14} />
                <span>+8% ce mois</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Boutiques</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.totalShops)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <ArrowUp size={14} />
                <span>+5 nouvelles</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Produits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.totalProducts)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <ArrowUp size={14} />
                <span>+24 nouveaux</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenu Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : `${formatCurrency(stats.totalRevenue)}`}
              </p>
              <p className="text-xs text-gray-500">FCFA</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Évolution des Revenus</h2>
              <p className="text-sm text-gray-500">Revenus générés sur la période</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={20} />
              <span className="font-medium">+18.5%</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {currentData.map((value, idx) => {
              const height = (value / maxValue) * 220 + 20
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-700 hover:to-indigo-500 transition-all cursor-pointer relative"
                    style={{ height: `${height}px` }}
                  >
                    <div className="hidden group-hover:block absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {formatCurrency(value)} FCFA
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {period === 'week' 
                      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][idx] 
                      : period === 'month' 
                        ? `${idx + 1}` 
                        : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][idx]
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Statistiques Clés</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Taux de conversion</span>
                <span className="text-sm font-bold text-green-600">3.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '38%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Panier moyen</span>
                <span className="text-sm font-bold text-indigo-600">45,000 FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Taux de retour</span>
                <span className="text-sm font-bold text-orange-600">2.1%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: '21%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Satisfaction client</span>
                <span className="text-sm font-bold text-purple-600">4.7/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-blue-100 text-sm">Visites aujourd'hui</p>
              <p className="text-2xl font-bold">2,847</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-100">
            <ArrowUp size={14} />
            <span>+15% vs hier</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-green-100 text-sm">Commandes aujourd'hui</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-100">
            <ArrowUp size={14} />
            <span>+8% vs hier</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-purple-100 text-sm">Nouveaux inscrits</p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-100">
            <ArrowUp size={14} />
            <span>+22% vs hier</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-orange-100 text-sm">Boutiques actives</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats.totalShops}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-orange-100">
            <ArrowUp size={14} />
            <span>+3 cette semaine</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminAnalyticsPage
