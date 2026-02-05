import React, { useState, useEffect } from 'react'
import { Shield, Save, X, Search, User, CheckCircle, XCircle } from 'lucide-react'
import { usersService, UserData } from '../../../lib/api/usersService'
import { usePermissions, ALL_PERMISSIONS } from '../../../hooks/usePermissions'
import { useToast } from '../../../components/Toast'

// Groupes de permissions pour une meilleure organisation
const PERMISSION_GROUPS = {
  'Utilisateurs': [
    { id: ALL_PERMISSIONS.USERS_VIEW, label: 'Voir les utilisateurs' },
    { id: ALL_PERMISSIONS.USERS_CREATE, label: 'Créer des utilisateurs' },
    { id: ALL_PERMISSIONS.USERS_EDIT, label: 'Modifier les utilisateurs' },
    { id: ALL_PERMISSIONS.USERS_DELETE, label: 'Supprimer les utilisateurs' },
    { id: ALL_PERMISSIONS.USERS_RESET_PASSWORD, label: 'Réinitialiser les mots de passe' },
    { id: ALL_PERMISSIONS.USERS_CHANGE_STATUS, label: 'Changer le statut des utilisateurs' },
  ],
  'Boutiques': [
    { id: ALL_PERMISSIONS.SHOPS_VIEW, label: 'Voir les boutiques' },
    { id: ALL_PERMISSIONS.SHOPS_CREATE, label: 'Créer des boutiques' },
    { id: ALL_PERMISSIONS.SHOPS_VALIDATE, label: 'Valider les boutiques' },
    { id: ALL_PERMISSIONS.SHOPS_EDIT, label: 'Modifier les boutiques' },
    { id: ALL_PERMISSIONS.SHOPS_DELETE, label: 'Supprimer les boutiques' },
  ],
  'Produits': [
    { id: ALL_PERMISSIONS.PRODUCTS_VIEW, label: 'Voir les produits' },
    { id: ALL_PERMISSIONS.PRODUCTS_CREATE, label: 'Créer des produits' },
    { id: ALL_PERMISSIONS.PRODUCTS_EDIT, label: 'Modifier les produits' },
    { id: ALL_PERMISSIONS.PRODUCTS_DELETE, label: 'Supprimer les produits' },
    { id: ALL_PERMISSIONS.PRODUCTS_MODERATE, label: 'Modérer les produits' },
  ],
  'Commandes': [
    { id: ALL_PERMISSIONS.ORDERS_VIEW, label: 'Voir les commandes' },
    { id: ALL_PERMISSIONS.ORDERS_CREATE, label: 'Créer des commandes' },
    { id: ALL_PERMISSIONS.ORDERS_MANAGE, label: 'Gérer les commandes' },
    { id: ALL_PERMISSIONS.ORDERS_CANCEL, label: 'Annuler les commandes' },
  ],
  'Catégories': [
    { id: ALL_PERMISSIONS.CATEGORIES_VIEW, label: 'Voir les catégories' },
    { id: ALL_PERMISSIONS.CATEGORIES_CREATE, label: 'Créer des catégories' },
    { id: ALL_PERMISSIONS.CATEGORIES_EDIT, label: 'Modifier les catégories' },
    { id: ALL_PERMISSIONS.CATEGORIES_DELETE, label: 'Supprimer les catégories' },
  ],
  'Avis': [
    { id: ALL_PERMISSIONS.REVIEWS_VIEW, label: 'Voir les avis' },
    { id: ALL_PERMISSIONS.REVIEWS_MODERATE, label: 'Modérer les avis' },
    { id: ALL_PERMISSIONS.REVIEWS_DELETE, label: 'Supprimer les avis' },
  ],
  'Messages': [
    { id: ALL_PERMISSIONS.MESSAGES_VIEW, label: 'Voir les messages client-vendeur' },
    { id: ALL_PERMISSIONS.MESSAGES_MANAGE, label: 'Gérer les messages' },
    { id: ALL_PERMISSIONS.MESSAGES_DELETE, label: 'Supprimer les messages' },
  ],
  'Notifications': [
    { id: ALL_PERMISSIONS.NOTIFICATIONS_VIEW, label: 'Voir les notifications' },
    { id: ALL_PERMISSIONS.NOTIFICATIONS_SEND, label: 'Envoyer des notifications' },
    { id: ALL_PERMISSIONS.NOTIFICATIONS_MANAGE, label: 'Gérer les notifications' },
  ],
  'Rapports & Statistiques': [
    { id: ALL_PERMISSIONS.REPORTS_VIEW, label: 'Voir les rapports' },
    { id: ALL_PERMISSIONS.REPORTS_EXPORT, label: 'Exporter les rapports' },
    { id: ALL_PERMISSIONS.STATISTICS_VIEW, label: 'Voir les statistiques' },
    { id: ALL_PERMISSIONS.STATISTICS_EXPORT, label: 'Exporter les statistiques' },
    { id: ALL_PERMISSIONS.ANALYTICS_VIEW, label: 'Voir les analytics' },
  ],
  'Modération': [
    { id: ALL_PERMISSIONS.MODERATION_VIEW, label: 'Voir la modération' },
    { id: ALL_PERMISSIONS.MODERATION_MANAGE, label: 'Gérer la modération' },
  ],
  'Paramètres': [
    { id: ALL_PERMISSIONS.SETTINGS_VIEW, label: 'Voir les paramètres' },
    { id: ALL_PERMISSIONS.SETTINGS_EDIT, label: 'Modifier les paramètres' },
  ],
}

const PermissionsManagementPage: React.FC = () => {
  const { showToast } = useToast()
  const { isSuperAdmin } = usePermissions()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers()
    }
  }, [isSuperAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersService.getAllUsers(1, 100)
      if (response.data) {
        // Filtrer pour ne montrer que les admins non super-admins
        const results = response.data.results || []
        const adminUsers = results.filter(
          (u: UserData) => u.is_staff && !u.is_superuser
        )
        setUsers(adminUsers)
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des utilisateurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user)
    setUserPermissions(user.permissions || [])
  }

  const togglePermission = (permissionId: string) => {
    setUserPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const toggleGroupPermissions = (groupPermissions: { id: string; label: string }[]) => {
    const groupIds = groupPermissions.map(p => p.id)
    const allSelected = groupIds.every(id => userPermissions.includes(id))
    
    if (allSelected) {
      // Désélectionner tout le groupe
      setUserPermissions(prev => prev.filter(p => !groupIds.includes(p)))
    } else {
      // Sélectionner tout le groupe
      setUserPermissions(prev => {
        const newPerms = [...prev]
        groupIds.forEach(id => {
          if (!newPerms.includes(id)) {
            newPerms.push(id)
          }
        })
        return newPerms
      })
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      await usersService.updateUser(selectedUser.id, {
        permissions: userPermissions
      })
      showToast('Permissions mises à jour avec succès', 'success')
      loadUsers()
      setSelectedUser(null)
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour des permissions', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Accès refusé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Seuls les super administrateurs peuvent gérer les permissions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="text-indigo-600" />
          Gestion des Permissions
        </h1>
        <p className="text-gray-600 mt-2">
          Contrôlez précisément les accès de chaque administrateur
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des utilisateurs */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>Aucun administrateur trouvé</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {user.permissions?.length || 0} permission(s)
                      </p>
                    </div>
                    {user.is_active ? (
                      <CheckCircle className="text-green-500 flex-shrink-0 ml-2" size={20} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0 ml-2" size={20} />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panneau de permissions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          {selectedUser ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
                    const allSelected = permissions.every(p => userPermissions.includes(p.id))
                    const someSelected = permissions.some(p => userPermissions.includes(p.id))

                    return (
                      <div key={groupName} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{groupName}</h3>
                          <button
                            onClick={() => toggleGroupPermissions(permissions)}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                              allSelected
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : someSelected
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {permissions.map(permission => (
                            <label
                              key={permission.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={userPermissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="ml-3 text-sm text-gray-700">{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <strong>{userPermissions.length}</strong> permission(s) sélectionnée(s)
                </p>
                <button
                  onClick={handleSavePermissions}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Shield className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Sélectionnez un administrateur
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Choisissez un utilisateur dans la liste pour gérer ses permissions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PermissionsManagementPage
