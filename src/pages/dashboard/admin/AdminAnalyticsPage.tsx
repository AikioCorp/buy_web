import { useState } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart,
  DollarSign, Eye, Calendar, ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Target
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

const metrics: MetricCard[] = [
  { title: 'Visiteurs uniques', value: '12,456', change: 15.2, icon: Eye, color: 'blue' },
  { title: 'Taux de conversion', value: '3.2%', change: 0.5, icon: Target, color: 'green' },
  { title: 'Panier moyen', value: '45,000 FCFA', change: -2.3, icon: ShoppingCart, color: 'purple' },
  { title: 'Revenus', value: '8.5M FCFA', change: 12.8, icon: DollarSign, color: 'orange' }
]

const topProducts = [
  { name: 'iPhone 15 Pro', sales: 234, revenue: '2.3M FCFA' },
  { name: 'Samsung Galaxy S24', sales: 189, revenue: '1.8M FCFA' },
  { name: 'MacBook Air M3', sales: 156, revenue: '1.5M FCFA' },
  { name: 'AirPods Pro', sales: 145, revenue: '580K FCFA' },
  { name: 'iPad Pro', sales: 123, revenue: '1.2M FCFA' }
]

const topCategories = [
  { name: 'Électronique', percentage: 35, color: 'bg-blue-500' },
  { name: 'Mode', percentage: 25, color: 'bg-purple-500' },
  { name: 'Alimentation', percentage: 20, color: 'bg-green-500' },
  { name: 'Maison', percentage: 12, color: 'bg-orange-500' },
  { name: 'Autres', percentage: 8, color: 'bg-gray-500' }
]

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('month')

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
