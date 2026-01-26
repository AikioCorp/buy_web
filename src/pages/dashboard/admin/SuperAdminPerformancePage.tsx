import React, { useState, useEffect } from 'react'
import { 
  Gauge, Server, Database, Cpu, HardDrive, Activity, 
  Clock, CheckCircle, AlertTriangle, Zap, Globe, RefreshCw
} from 'lucide-react'

interface SystemMetric {
  name: string
  value: number
  max: number
  unit: string
  status: 'good' | 'warning' | 'critical'
}

const SuperAdminPerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    // Simuler le chargement
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLastUpdate(new Date())
    }, 1000)
  }

  const systemMetrics: SystemMetric[] = [
    { name: 'CPU', value: 32, max: 100, unit: '%', status: 'good' },
    { name: 'Mémoire', value: 4.2, max: 8, unit: 'GB', status: 'good' },
    { name: 'Stockage', value: 45, max: 100, unit: 'GB', status: 'warning' },
    { name: 'Bande passante', value: 125, max: 500, unit: 'Mbps', status: 'good' },
  ]

  const apiEndpoints = [
    { name: '/api/products/', status: 'online', responseTime: 45, requests: 12450 },
    { name: '/api/orders/', status: 'online', responseTime: 62, requests: 8920 },
    { name: '/api/users/', status: 'online', responseTime: 38, requests: 5670 },
    { name: '/api/auth/', status: 'online', responseTime: 28, requests: 15890 },
    { name: '/api/categories/', status: 'online', responseTime: 22, requests: 3450 },
    { name: '/api/stores/', status: 'online', responseTime: 55, requests: 4230 },
  ]

  const recentEvents = [
    { type: 'success', message: 'Déploiement réussi v2.4.1', time: 'Il y a 2 heures' },
    { type: 'info', message: 'Backup automatique complété', time: 'Il y a 4 heures' },
    { type: 'warning', message: 'Pic de trafic détecté', time: 'Il y a 6 heures' },
    { type: 'success', message: 'Cache invalidé avec succès', time: 'Il y a 8 heures' },
    { type: 'info', message: 'Mise à jour SSL certificat', time: 'Il y a 12 heures' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'online':
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Système</h1>
          <p className="text-gray-600 mt-1">Surveillance en temps réel de la plateforme</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-sm text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Statut Global</p>
              <p className="text-xl font-bold text-green-600">Opérationnel</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Uptime</p>
              <p className="text-xl font-bold text-gray-900">99.98%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Temps de réponse</p>
              <p className="text-xl font-bold text-gray-900">42ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Requêtes/min</p>
              <p className="text-xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* System Resources */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Server className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Ressources Système</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {systemMetrics.map((metric, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {metric.name === 'CPU' && <Cpu size={16} className="text-gray-400" />}
                      {metric.name === 'Mémoire' && <Database size={16} className="text-gray-400" />}
                      {metric.name === 'Stockage' && <HardDrive size={16} className="text-gray-400" />}
                      {metric.name === 'Bande passante' && <Activity size={16} className="text-gray-400" />}
                      <span className="font-medium text-gray-700">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{metric.value} {metric.unit}</span>
                      <span className="text-gray-400">/ {metric.max} {metric.unit}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getProgressColor(metric.status)} transition-all`}
                      style={{ width: `${(metric.value / metric.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Gauge className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Endpoints API</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${endpoint.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-mono text-sm text-gray-700">{endpoint.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{endpoint.responseTime}ms</span>
                    <span className="text-gray-400">{endpoint.requests.toLocaleString()} req</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Événements Récents</h2>
        </div>

        <div className="space-y-3">
          {recentEvents.map((event, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.type)}`}>
                {event.type === 'success' && <CheckCircle size={16} />}
                {event.type === 'warning' && <AlertTriangle size={16} />}
                {event.type === 'info' && <Activity size={16} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.message}</p>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminPerformancePage
