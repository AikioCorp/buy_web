import { useState } from 'react'
import { 
  Shield, Lock, Key, AlertTriangle, CheckCircle, XCircle,
  Eye, EyeOff, Clock, MapPin, Monitor, Smartphone,
  RefreshCw, Download, Settings
} from 'lucide-react'

interface SecurityLog {
  id: number
  action: string
  user: string
  ip: string
  device: string
  location: string
  status: 'success' | 'failed' | 'warning'
  timestamp: string
}

const securityLogs: SecurityLog[] = [
  {
    id: 1,
    action: 'Connexion réussie',
    user: 'admin@buymore.ml',
    ip: '192.168.1.100',
    device: 'Chrome / Windows',
    location: 'Bamako, Mali',
    status: 'success',
    timestamp: '2026-01-28 14:30:00'
  },
  {
    id: 2,
    action: 'Tentative de connexion échouée',
    user: 'unknown@test.com',
    ip: '45.67.89.123',
    device: 'Firefox / Linux',
    location: 'Lagos, Nigeria',
    status: 'failed',
    timestamp: '2026-01-28 14:25:00'
  },
  {
    id: 3,
    action: 'Modification des permissions',
    user: 'superadmin@buymore.ml',
    ip: '192.168.1.101',
    device: 'Safari / macOS',
    location: 'Bamako, Mali',
    status: 'warning',
    timestamp: '2026-01-28 13:45:00'
  },
  {
    id: 4,
    action: 'Export de données',
    user: 'admin@buymore.ml',
    ip: '192.168.1.100',
    device: 'Chrome / Windows',
    location: 'Bamako, Mali',
    status: 'success',
    timestamp: '2026-01-28 12:00:00'
  }
]

const securitySettings = [
  { name: 'Authentification à deux facteurs', enabled: true, description: 'Exiger 2FA pour tous les admins' },
  { name: 'Verrouillage après échecs', enabled: true, description: 'Bloquer après 5 tentatives échouées' },
  { name: 'Sessions multiples', enabled: false, description: 'Autoriser plusieurs sessions simultanées' },
  { name: 'Notifications de connexion', enabled: true, description: 'Envoyer un email à chaque connexion' }
]

export default function AdminSecurityPage() {
  const [settings, setSettings] = useState(securitySettings)
  const [showApiKey, setShowApiKey] = useState(false)

  const toggleSetting = (index: number) => {
    const newSettings = [...settings]
    newSettings[index].enabled = !newSettings[index].enabled
    setSettings(newSettings)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600" />
            Sécurité
          </h1>
          <p className="text-gray-500 mt-1">Gérez la sécurité et les accès de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Exporter les logs
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-sm text-gray-500">Connexions réussies</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">56</p>
              <p className="text-sm text-gray-500">Tentatives échouées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Alertes de sécurité</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-500">Comptes bloqués</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Paramètres de sécurité
          </h3>
          <div className="space-y-4">
            {settings.map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{setting.name}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(index)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    setting.enabled ? 'left-7' : 'left-1'
                  }`}></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-600" />
            Clés API
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Clé API principale</p>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                  {showApiKey ? 'sk_live_abc123xyz789def456' : '••••••••••••••••••••'}
                </code>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Attention</p>
                  <p className="text-sm text-yellow-700">Ne partagez jamais vos clés API. Régénérez-les si elles sont compromises.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Logs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Journal de sécurité</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Utilisateur</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Appareil</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Localisation</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {securityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{log.action}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{log.user}</p>
                    <p className="text-xs text-gray-400">{log.ip}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      {log.device}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {log.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusIcon(log.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {log.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
