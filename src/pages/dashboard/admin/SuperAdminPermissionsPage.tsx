import React, { useState, useEffect } from 'react'
import { 
  Shield, Users, Search, Edit2, Save, X, Check, AlertTriangle,
  Eye, Package, ShoppingBag, Store, Settings, UserCog, Lock
} from 'lucide-react'
import { usersService, UserData } from '../../../lib/api/usersService'

interface Permission {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'users' | 'shops' | 'products' | 'orders' | 'settings'
}

const allPermissions: Permission[] = [
  // Users
  { id: 'users_view', name: 'Voir les utilisateurs', description: 'Accès en lecture à la liste des utilisateurs', icon: <Eye size={16} />, category: 'users' },
  { id: 'users_edit', name: 'Modifier les utilisateurs', description: 'Modifier les informations des utilisateurs', icon: <Edit2 size={16} />, category: 'users' },
  { id: 'users_delete', name: 'Supprimer les utilisateurs', description: 'Supprimer des comptes utilisateurs', icon: <AlertTriangle size={16} />, category: 'users' },
  { id: 'users_create', name: 'Créer des utilisateurs', description: 'Créer de nouveaux comptes utilisateurs', icon: <Users size={16} />, category: 'users' },
  
  // Shops
  { id: 'shops_view', name: 'Voir les boutiques', description: 'Accès en lecture à la liste des boutiques', icon: <Eye size={16} />, category: 'shops' },
  { id: 'shops_validate', name: 'Valider les boutiques', description: 'Approuver ou rejeter les nouvelles boutiques', icon: <Check size={16} />, category: 'shops' },
  { id: 'shops_edit', name: 'Modifier les boutiques', description: 'Modifier les informations des boutiques', icon: <Edit2 size={16} />, category: 'shops' },
  { id: 'shops_delete', name: 'Supprimer les boutiques', description: 'Supprimer des boutiques', icon: <AlertTriangle size={16} />, category: 'shops' },
  
  // Products
  { id: 'products_view', name: 'Voir les produits', description: 'Accès en lecture à tous les produits', icon: <Eye size={16} />, category: 'products' },
  { id: 'products_edit', name: 'Modifier les produits', description: 'Modifier les informations des produits', icon: <Edit2 size={16} />, category: 'products' },
  { id: 'products_delete', name: 'Supprimer les produits', description: 'Supprimer des produits', icon: <AlertTriangle size={16} />, category: 'products' },
  { id: 'products_moderate', name: 'Modérer les produits', description: 'Approuver ou masquer des produits', icon: <Shield size={16} />, category: 'products' },
  
  // Orders
  { id: 'orders_view', name: 'Voir les commandes', description: 'Accès en lecture à toutes les commandes', icon: <Eye size={16} />, category: 'orders' },
  { id: 'orders_manage', name: 'Gérer les commandes', description: 'Modifier le statut des commandes', icon: <ShoppingBag size={16} />, category: 'orders' },
  { id: 'orders_cancel', name: 'Annuler les commandes', description: 'Annuler des commandes', icon: <AlertTriangle size={16} />, category: 'orders' },
  
  // Settings
  { id: 'settings_view', name: 'Voir les paramètres', description: 'Accès aux paramètres système', icon: <Eye size={16} />, category: 'settings' },
  { id: 'settings_edit', name: 'Modifier les paramètres', description: 'Modifier les paramètres système', icon: <Settings size={16} />, category: 'settings' },
]

const categoryLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  users: { label: 'Utilisateurs', icon: <Users size={18} />, color: 'bg-blue-100 text-blue-700' },
  shops: { label: 'Boutiques', icon: <Store size={18} />, color: 'bg-green-100 text-green-700' },
  products: { label: 'Produits', icon: <Package size={18} />, color: 'bg-purple-100 text-purple-700' },
  orders: { label: 'Commandes', icon: <ShoppingBag size={18} />, color: 'bg-orange-100 text-orange-700' },
  settings: { label: 'Paramètres', icon: <Settings size={18} />, color: 'bg-gray-100 text-gray-700' },
}

const SuperAdminPermissionsPage: React.FC = () => {
  const [admins, setAdmins] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState<UserData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [adminPermissions, setAdminPermissions] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await usersService.getAllUsers(1, 100)
      
      if (response.data) {
        // Filtrer uniquement les admins (is_staff = true, is_superuser = false)
        let allUsers: UserData[] = []
        if (Array.isArray(response.data)) {
          allUsers = response.data
        } else if (response.data.results) {
          allUsers = response.data.results
        }
        
        const adminUsers = allUsers.filter(u => u.is_staff && !u.is_superuser)
        setAdmins(adminUsers)
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      setError(err.message || 'Erreur lors du chargement des administrateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPermissions = (admin: UserData) => {
    setSelectedAdmin(admin)
    // Simuler les permissions existantes (à remplacer par un vrai appel API)
    setAdminPermissions([
      'users_view', 'shops_view', 'products_view', 'orders_view'
    ])
    setIsEditModalOpen(true)
  }

  const togglePermission = (permissionId: string) => {
    if (adminPermissions.includes(permissionId)) {
      setAdminPermissions(adminPermissions.filter(p => p !== permissionId))
    } else {
      setAdminPermissions([...adminPermissions, permissionId])
    }
  }

  const toggleCategoryPermissions = (category: string) => {
    const categoryPerms = allPermissions.filter(p => p.category === category).map(p => p.id)
    const allSelected = categoryPerms.every(p => adminPermissions.includes(p))
    
    if (allSelected) {
      setAdminPermissions(adminPermissions.filter(p => !categoryPerms.includes(p)))
    } else {
      const newPerms = [...adminPermissions]
      categoryPerms.forEach(p => {
        if (!newPerms.includes(p)) {
          newPerms.push(p)
        }
      })
      setAdminPermissions(newPerms)
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return
    
    try {
      setActionLoading(true)
      // TODO: Appeler l'API pour sauvegarder les permissions
      // await permissionsService.updateAdminPermissions(selectedAdmin.id, adminPermissions)
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsEditModalOpen(false)
      setSelectedAdmin(null)
      alert('Permissions mises à jour avec succès!')
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde des permissions')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredAdmins = searchQuery
    ? admins.filter(a => 
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : admins

  const getPermissionsByCategory = (category: string) => {
    return allPermissions.filter(p => p.category === category)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions</h1>
          <p className="text-gray-600 mt-1">
            Gérez les droits d'accès des administrateurs
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">À propos des permissions</h3>
            <p className="text-sm text-blue-700 mt-1">
              Les permissions permettent de contrôler ce que chaque administrateur peut voir et faire sur la plateforme. 
              Seuls les <strong>Super Admins</strong> peuvent modifier les permissions des autres administrateurs.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un administrateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadAdmins}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <UserCog className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun administrateur</h3>
            <p className="text-gray-500">
              Il n'y a pas encore d'administrateurs à gérer. Les administrateurs sont les utilisateurs avec le statut "staff".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 font-bold">
                            {admin.email?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.first_name && admin.last_name 
                              ? `${admin.first_name} ${admin.last_name}`
                              : admin.username || 'Admin'}
                          </div>
                          <div className="text-sm text-gray-500">@{admin.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Shield size={12} />
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">4 permissions</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditPermissions(admin)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Lock size={14} />
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Permissions Modal */}
      {isEditModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Permissions de {selectedAdmin.username}</h2>
                  <p className="text-white/80 text-sm">{selectedAdmin.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {Object.keys(categoryLabels).map((category) => {
                  const categoryInfo = categoryLabels[category]
                  const categoryPerms = getPermissionsByCategory(category)
                  const selectedCount = categoryPerms.filter(p => adminPermissions.includes(p.id)).length
                  const allSelected = selectedCount === categoryPerms.length
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div 
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${categoryInfo.color}`}
                        onClick={() => toggleCategoryPermissions(category)}
                      >
                        <div className="flex items-center gap-3">
                          {categoryInfo.icon}
                          <span className="font-medium">{categoryInfo.label}</span>
                          <span className="text-sm opacity-75">
                            ({selectedCount}/{categoryPerms.length})
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          allSelected 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : selectedCount > 0 
                              ? 'bg-indigo-200 border-indigo-400'
                              : 'border-gray-300'
                        }`}>
                          {allSelected && <Check size={14} className="text-white" />}
                          {!allSelected && selectedCount > 0 && <div className="w-2 h-2 bg-indigo-600 rounded-sm"></div>}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPerms.map((permission) => (
                            <label 
                              key={permission.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                adminPermissions.includes(permission.id)
                                  ? 'border-indigo-300 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={adminPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">{permission.icon}</span>
                                  <span className="font-medium text-gray-900 text-sm">{permission.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {adminPermissions.length} permission{adminPermissions.length > 1 ? 's' : ''} sélectionnée{adminPermissions.length > 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminPermissionsPage
