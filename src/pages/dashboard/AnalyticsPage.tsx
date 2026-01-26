import React, { useState } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Eye, ShoppingCart, 
  Users, Package, Calendar, ArrowUpRight, ArrowDownRight,
  DollarSign, Target, Clock, Percent
} from 'lucide-react'

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

// Simple Bar Chart
const SimpleBarChart = ({ data, labels }: { data: number[], labels: string[] }) => {
  const max = Math.max(...data)
  
  return (
    <div className="h-64 flex items-end justify-between gap-2">
      {data.map((value, idx) => {
        const height = (value / max) * 100
        return (
          <div key={idx} className="flex-1 flex flex-col items-center group">
            <div className="relative w-full">
              <div
                className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg hover:from-emerald-600 hover:to-emerald-500 transition-all cursor-pointer"
                style={{ height: `${height * 2}px` }}
              >
                <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {value.toLocaleString()} XOF
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{labels[idx]}</span>
          </div>
        )
      })}
    </div>
  )
}

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

  // Données fictives pour la démo
  const chartData = {
    '7d': [12000, 15000, 8000, 22000, 18000, 25000, 20000],
    '30d': [45000, 52000, 48000, 65000, 72000, 68000, 75000, 82000, 78000, 85000, 90000, 95000],
    '90d': [150000, 180000, 165000, 200000, 220000, 195000, 240000, 260000, 250000, 280000, 300000, 320000],
    '1y': [500000, 650000, 720000, 800000, 950000, 1100000, 1250000, 1400000, 1550000, 1700000, 1850000, 2000000],
  }

  const chartLabels = {
    '7d': ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    '30d': ['1', '5', '10', '15', '20', '25', '30', '', '', '', '', ''],
    '90d': ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    '1y': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  }

  // Top produits fictifs
  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 45, revenue: '67,500,000 XOF' },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: '45,600,000 XOF' },
    { name: 'MacBook Pro M3', sales: 22, revenue: '55,000,000 XOF' },
    { name: 'AirPods Pro 2', sales: 67, revenue: '13,400,000 XOF' },
    { name: 'iPad Air', sales: 31, revenue: '24,800,000 XOF' },
  ]

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
          value="0 XOF"
          change="Pas encore de données"
          changeType="neutral"
          icon={<DollarSign size={24} className="text-emerald-600" />}
          color="bg-emerald-100"
        />
        <StatCard
          title="Commandes"
          value="0"
          change="Pas encore de données"
          changeType="neutral"
          icon={<ShoppingCart size={24} className="text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Visiteurs"
          value="0"
          change="Pas encore de données"
          changeType="neutral"
          icon={<Eye size={24} className="text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          title="Taux de conversion"
          value="0%"
          change="Pas encore de données"
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
          
          <div className="text-center py-8 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucun produit vendu</p>
            <p className="text-sm">Vos meilleurs produits apparaîtront ici</p>
          </div>
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
