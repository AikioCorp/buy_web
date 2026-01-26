import React, { useState } from 'react'
import {
  Users, ShoppingBag, AlertTriangle, TrendingUp, BarChart3,
  Eye, Trash2, Edit, Flag, Ban, CheckCircle, XCircle, Clock,
  Download, Filter, Search, Plus, MoreVertical
} from 'lucide-react'

const StatCard = ({ title, value, icon, color, subtext }: any) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className={`${color} p-3 rounded-lg`}>{icon}</div>
    </div>
  </div>
)

interface User {
  id: number
  username: string
  email: string
  role: 'client' | 'vendor' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  joinDate: string
  lastActive: string
}

const UserManagementTable = ({ users }: { users: User[] }) => {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    suspended: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    banned: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
  }

  const roleColors = {
    client: 'bg-blue-50 text-blue-700',
    vendor: 'bg-purple-50 text-purple-700',
    admin: 'bg-orange-50 text-orange-700'
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier accès</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => {
              const StatusIcon = statusConfig[user.status].icon
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role === 'client' ? 'Client' : user.role === 'vendor' ? 'Vendeur' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 ${statusConfig[user.status].text}`}>
                      <StatusIcon size={16} />
                      <span className="text-sm font-medium capitalize">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{user.joinDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{user.lastActive}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors">
                        <Flag size={18} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Ban size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface Report {
  id: number
  type: 'content' | 'user' | 'product' | 'shop'
  title: string
  reporter: string
  reported: string
  status: 'new' | 'investigating' | 'resolved'
  date: string
  priority: 'low' | 'medium' | 'high'
}

const ReportCard = ({ report }: { report: Report }) => {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    new: 'bg-purple-100 text-purple-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800'
  }

  const typeLabels = {
    content: 'Contenu',
    user: 'Utilisateur',
    product: 'Produit',
    shop: 'Boutique'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[report.priority]}`}>
              {report.priority === 'low' ? 'Basse' : report.priority === 'medium' ? 'Moyenne' : 'Haute'}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[report.status]}`}>
              {report.status === 'new' ? 'Nouveau' : report.status === 'investigating' ? 'En investigation' : 'Résolu'}
            </span>
          </div>
          <h3 className="font-bold text-gray-900">{report.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{typeLabels[report.type]}</p>
        </div>
        <Flag size={20} className="text-orange-500" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b">
        <div>
          <p className="text-xs text-gray-500">Signalé par</p>
          <p className="font-medium text-sm">{report.reporter}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Signalé</p>
          <p className="font-medium text-sm">{report.reported}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">{report.date}</p>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
          Enquêter
        </button>
        <button className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors">
          Résoudre
        </button>
      </div>
    </div>
  )
}

const AdminDashboardPage: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'users' | 'reports'>('overview')

  const mockUsers: User[] = [
    { id: 1, username: 'oumou_sadji', email: 'oumou@example.com', role: 'client', status: 'active', joinDate: '2024-01-15', lastActive: '2 minutes' },
    { id: 2, username: 'ibrahim_shop', email: 'ibrahim@example.com', role: 'vendor', status: 'active', joinDate: '2024-02-10', lastActive: '1 hour' },
    { id: 3, username: 'fatou_kone', email: 'fatou@example.com', role: 'client', status: 'suspended', joinDate: '2024-01-20', lastActive: '3 days' },
    { id: 4, username: 'moussa_keita', email: 'moussa@example.com', role: 'vendor', status: 'active', joinDate: '2024-01-05', lastActive: '30 minutes' },
    { id: 5, username: 'mariam_diallo', email: 'mariam@example.com', role: 'client', status: 'banned', joinDate: '2023-12-20', lastActive: 'never' },
  ]

  const mockReports: Report[] = [
    { id: 1, type: 'product', title: 'Produit contrefait détecté', reporter: 'user123', reported: 'samsung_shop', status: 'investigating', date: '2024-01-20', priority: 'high' },
    { id: 2, type: 'user', title: 'Comportement abusif', reporter: 'user456', reported: 'john_doe', status: 'new', date: '2024-01-21', priority: 'high' },
    { id: 3, type: 'content', title: 'Contenu offensant', reporter: 'user789', reported: 'comment_123', status: 'resolved', date: '2024-01-19', priority: 'medium' },
    { id: 4, type: 'shop', title: 'Boutique suspecte', reporter: 'admin', reported: 'new_shop', status: 'investigating', date: '2024-01-21', priority: 'medium' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
        <p className="text-gray-600 mt-1">Gérez les utilisateurs, modérez le contenu et surveillez la plateforme</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Utilisateurs"
          value="2,543"
          icon={<Users size={24} className="text-white" />}
          color="bg-blue-500"
          subtext="+12 cette semaine"
        />
        <StatCard
          title="Utilisateurs Actifs"
          value="1,892"
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-green-500"
          subtext="Aujourd'hui"
        />
        <StatCard
          title="Rapports Signalés"
          value="24"
          icon={<Flag size={24} className="text-white" />}
          color="bg-orange-500"
          subtext="8 en attente"
        />
        <StatCard
          title="Comptes Suspendus"
          value="12"
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-red-500"
          subtext="3 cette semaine"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-3 font-medium transition-colors ${
            tab === 'overview'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-3 font-medium transition-colors ${
            tab === 'users'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Gestion Utilisateurs
        </button>
        <button
          onClick={() => setTab('reports')}
          className={`px-4 py-3 font-medium transition-colors ${
            tab === 'reports'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rapports & Modération
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activité Récente</h2>
            <div className="space-y-4">
              {[
                { action: 'Nouvel utilisateur inscrit', user: 'Oumou Sadji', time: '5 minutes', icon: '📝' },
                { action: 'Produit signalé comme contrefait', user: 'Samsung Shop', time: '15 minutes', icon: '⚠️' },
                { action: 'Compte suspendu', user: 'Ahmed Hussein', time: '1 heure', icon: '🚫' },
                { action: 'Rapport résolu', user: 'Contenu offensant', time: '2 heures', icon: '✅' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.action}</p>
                      <p className="text-sm text-gray-600">{item.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Top Vendeurs</h3>
              <div className="space-y-3">
                {['Samsung Shop', 'Electronics Hub', 'Tech Store'].map((shop, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{shop}</p>
                      <p className="text-xs text-gray-500">{450 - idx * 50} produits</p>
                    </div>
                    <span className="text-green-600 font-bold">⭐ 4.8</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Alertes Système</h3>
              <div className="space-y-2">
                <div className="p-2 bg-red-50 text-red-700 rounded text-xs">
                  ⚠️ 8 rapports en attente
                </div>
                <div className="p-2 bg-yellow-50 text-yellow-700 rounded text-xs">
                  ⚠️ Serveur: 75% d'utilisation CPU
                </div>
                <div className="p-2 bg-blue-50 text-blue-700 rounded text-xs">
                  ℹ️ Mise à jour disponible
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter size={18} />
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus size={18} />
            </button>
          </div>
          <UserManagementTable users={mockUsers} />
        </div>
      )}

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div>
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
