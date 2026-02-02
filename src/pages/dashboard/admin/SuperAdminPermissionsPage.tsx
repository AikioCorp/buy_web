import React, { useState, useEffect } from 'react'
import { 
  Shield, Users, Search, Save, X, Check, AlertTriangle,
  Eye, Package, ShoppingBag, Store, Settings, UserCog, Lock,
  Sparkles, RefreshCw, Loader2, Edit2
} from 'lucide-react'
import { usersService, UserData } from '../../../lib/api/usersService'
import { useToast } from '../../../components/Toast'

interface Permission {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'users' | 'shops' | 'products' | 'orders' | 'moderation' | 'settings'
}

const allPermissions: Permission[] = [
  // Users
  { id: 'users_view', name: 'Voir les utilisateurs', description: 'Accès en lecture à la liste des utilisateurs', icon: <Eye size={16} />, category: 'users' },
  { id: 'users_create', name: 'Créer des utilisateurs', description: 'Créer de nouveaux comptes utilisateurs', icon: <Users size={16} />, category: 'users' },
  { id: 'users_edit', name: 'Modifier les utilisateurs', description: 'Modifier les informations des utilisateurs', icon: <Edit2 size={16} />, category: 'users' },
  { id: 'users_delete', name: 'Supprimer les utilisateurs', description: 'Supprimer des comptes utilisateurs', icon: <AlertTriangle size={16} />, category: 'users' },
  
  // Shops
  { id: 'shops_view', name: 'Voir les boutiques', description: 'Accès en lecture à la liste des boutiques', icon: <Eye size={16} />, category: 'shops' },
  { id: 'shops_create', name: 'Créer des boutiques', description: 'Créer de nouvelles boutiques', icon: <Store size={16} />, category: 'shops' },
  { id: 'shops_validate', name: 'Valider les boutiques', description: 'Approuver ou rejeter les nouvelles boutiques', icon: <Check size={16} />, category: 'shops' },
  { id: 'shops_edit', name: 'Modifier les boutiques', description: 'Modifier les informations des boutiques', icon: <Edit2 size={16} />, category: 'shops' },
  { id: 'shops_delete', name: 'Supprimer les boutiques', description: 'Supprimer des boutiques', icon: <AlertTriangle size={16} />, category: 'shops' },
  
  // Products
  { id: 'products_view', name: 'Voir les produits', description: 'Accès en lecture à tous les produits', icon: <Eye size={16} />, category: 'products' },
  { id: 'products_create', name: 'Créer des produits', description: 'Créer de nouveaux produits', icon: <Package size={16} />, category: 'products' },
  { id: 'products_edit', name: 'Modifier les produits', description: 'Modifier les informations des produits', icon: <Edit2 size={16} />, category: 'products' },
  { id: 'products_delete', name: 'Supprimer les produits', description: 'Supprimer des produits', icon: <AlertTriangle size={16} />, category: 'products' },
  { id: 'products_moderate', name: 'Modérer les produits', description: 'Approuver ou masquer des produits', icon: <Shield size={16} />, category: 'products' },
  
  // Orders
  { id: 'orders_view', name: 'Voir les commandes', description: 'Accès en lecture à toutes les commandes', icon: <Eye size={16} />, category: 'orders' },
  { id: 'orders_create', name: 'Créer des commandes', description: 'Créer de nouvelles commandes', icon: <ShoppingBag size={16} />, category: 'orders' },
  { id: 'orders_manage', name: 'Gérer les commandes', description: 'Modifier le statut des commandes', icon: <ShoppingBag size={16} />, category: 'orders' },
  { id: 'orders_cancel', name: 'Annuler les commandes', description: 'Annuler des commandes', icon: <AlertTriangle size={16} />, category: 'orders' },
  
  // Moderation
  { id: 'moderation_view', name: 'Voir la modération', description: 'Accès à la page de modération', icon: <Eye size={16} />, category: 'moderation' },
  { id: 'moderation_manage', name: 'Gérer la modération', description: 'Approuver ou rejeter les signalements', icon: <Shield size={16} />, category: 'moderation' },
  
  // Settings
  { id: 'settings_view', name: 'Voir les paramètres', description: 'Accès aux paramètres système', icon: <Eye size={16} />, category: 'settings' },
  { id: 'settings_edit', name: 'Modifier les paramètres', description: 'Modifier les paramètres système', icon: <Settings size={16} />, category: 'settings' },
]

const categoryLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  users: { label: 'Utilisateurs', icon: <Users size={18} />, color: 'bg-blue-100 text-blue-700' },
  shops: { label: 'Boutiques', icon: <Store size={18} />, color: 'bg-green-100 text-green-700' },
  products: { label: 'Produits', icon: <Package size={18} />, color: 'bg-purple-100 text-purple-700' },
  orders: { label: 'Commandes', icon: <ShoppingBag size={18} />, color: 'bg-orange-100 text-orange-700' },
  moderation: { label: 'Modération', icon: <Shield size={18} />, color: 'bg-red-100 text-red-700' },
  settings: { label: 'Paramètres', icon: <Settings size={18} />, color: 'bg-gray-100 text-gray-700' },
}

const SuperAdminPermissionsPage: React.FC = () => {
  const { showToast } = useToast()
  const [admins, setAdmins] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState<UserData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [adminPermissions, setAdminPermissions] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [_expandedCategory, _setExpandedCategory] = useState<string | null>('users') // Reserved for future accordion

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
    // Load actual permissions from admin data or use defaults
    const existingPermissions = (admin as any).permissions || ['users_view', 'shops_view', 'products_view', 'orders_view']
    setAdminPermissions(existingPermissions)
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
      // Save permissions via API
      await usersService.updateUser(selectedAdmin.id, { permissions: adminPermissions } as any)
      
      setIsEditModalOpen(false)
      setSelectedAdmin(null)
      loadAdmins() // Reload to get updated data
      showToast('Permissions mises à jour avec succès!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde des permissions', 'error')
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Permissions</h1>
              <p className="text-white/80 mt-1">Contrôlez les accès de vos administrateurs</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Users size={18} />
              <span className="font-medium">{admins.length} Administrateurs</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Sparkles size={18} />
              <span className="font-medium">{allPermissions.length} Permissions disponibles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un administrateur par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <button 
            onClick={loadAdmins}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-medium text-gray-700">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Admin Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement des administrateurs...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button onClick={loadAdmins} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
            Réessayer
          </button>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
            <UserCog className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun administrateur trouvé</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Il n'y a pas encore d'administrateurs à gérer. Les administrateurs sont les utilisateurs avec le statut "staff".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.map((admin) => {
            const permCount = (admin as any).permissions?.length || 0
            const permPercent = Math.round((permCount / allPermissions.length) * 100)
            
            return (
              <div key={admin.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                {/* Card Header with gradient */}
                <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {admin.first_name?.charAt(0) || admin.email?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="pt-12 pb-6 px-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {admin.first_name && admin.last_name 
                        ? `${admin.first_name} ${admin.last_name}`
                        : admin.username || 'Admin'}
                    </h3>
                    <p className="text-gray-500 text-sm">{admin.email}</p>
                  </div>
                  
                  {/* Permission Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Permissions actives</span>
                      <span className="font-bold text-indigo-600">{permCount}/{allPermissions.length}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${permPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Category badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Object.entries(categoryLabels).map(([key, cat]) => {
                      const catPerms = allPermissions.filter(p => p.category === key)
                      const hasAny = catPerms.some(p => (admin as any).permissions?.includes(p.id))
                      return hasAny ? (
                        <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cat.color}`}>
                          {cat.icon}
                        </span>
                      ) : null
                    })}
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => handleEditPermissions(admin)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40"
                  >
                    <Lock size={18} />
                    Gérer les permissions
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
