import React, { useState, useEffect } from 'react'
import { 
  Search, Edit2, Trash2, Shield, ShieldCheck, Store, User as UserIcon, 
  X, Save, LayoutGrid, List, Users, Loader2, RefreshCw, UserPlus, Ban
} from 'lucide-react'
import { usersService, UserData } from '../../../lib/api/usersService'
import { usePermissions } from '../../../hooks/usePermissions'

export default function AdminUsersPage() {
  const { 
    isSuperAdmin, 
    canViewUsers, 
    canEditUsers, 
    canDeleteUsers, 
    canCreateUsers 
  } = usePermissions()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'client' | 'vendor' | 'admin' | 'super_admin'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<Partial<UserData>>({})
  const [actionLoading, setActionLoading] = useState(false)

  const pageSize = 20

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchQuery])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (searchQuery.trim()) {
        response = await usersService.searchUsers(searchQuery, currentPage, pageSize)
      } else {
        response = await usersService.getAllUsers(currentPage, pageSize)
      }

      if (response.data) {
        if (Array.isArray(response.data)) {
          setUsers(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setUsers(response.data.results)
          setTotalCount(response.data.count)
        } else {
          setUsers([])
          setTotalCount(0)
        }
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      setError(err.message || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleEditUser = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_seller: user.is_seller,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      is_active: user.is_active
    })
    setIsEditModalOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      setActionLoading(true)
      await usersService.updateUser(editingUser.id, formData)
      setIsEditModalOpen(false)
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      setActionLoading(true)
      await usersService.deleteUser(userToDelete.id)
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (user: UserData) => {
    try {
      await usersService.updateUser(user.id, { is_active: !user.is_active })
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la modification du statut')
    }
  }

  const getRoleInfo = (user: UserData) => {
    if (user.is_superuser) return { icon: ShieldCheck, label: 'Super Admin', bg: 'bg-purple-100 text-purple-700', color: 'from-purple-500 to-indigo-600' }
    if (user.is_staff) return { icon: Shield, label: 'Admin', bg: 'bg-red-100 text-red-700', color: 'from-red-500 to-orange-500' }
    if (user.is_seller) return { icon: Store, label: 'Vendeur', bg: 'bg-blue-100 text-blue-700', color: 'from-blue-500 to-cyan-500' }
    return { icon: UserIcon, label: 'Client', bg: 'bg-gray-100 text-gray-700', color: 'from-gray-500 to-gray-600' }
  }

  // Filter users - hide super admins from non-super admin views
  const usersWithoutSuperAdmins = isSuperAdmin 
    ? (users || []) 
    : (users || []).filter(user => !user.is_superuser)

  const filteredUsers = selectedFilter === 'all'
    ? usersWithoutSuperAdmins
    : usersWithoutSuperAdmins.filter(user => {
        if (selectedFilter === 'super_admin') return user.is_superuser
        if (selectedFilter === 'admin') return user.is_staff && !user.is_superuser
        if (selectedFilter === 'vendor') return user.is_seller
        if (selectedFilter === 'client') return !user.is_seller && !user.is_staff && !user.is_superuser
        return true
      })

  const totalPages = Math.ceil(totalCount / pageSize)
  const activeUsersCount = users.filter(u => u.is_active).length
  const vendorsCount = users.filter(u => u.is_seller).length
  const adminsCount = users.filter(u => u.is_staff || u.is_superuser).length

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-500 mt-1">{totalCount} utilisateurs enregistrés</p>
        </div>
        {canCreateUsers() && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
            <UserPlus size={20} />
            Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Permission Warning */}
      {!canViewUsers() && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Ban className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800">Vous n'avez pas la permission de voir les utilisateurs. Contactez un administrateur.</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-2xl font-bold mt-1">{totalCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Actifs</p>
              <p className="text-2xl font-bold mt-1">{activeUsersCount}</p>
            </div>
            <UserIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Vendeurs</p>
              <p className="text-2xl font-bold mt-1">{vendorsCount}</p>
            </div>
            <Store className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Admins</p>
              <p className="text-2xl font-bold mt-1">{adminsCount}</p>
            </div>
            <Shield className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </form>
          <div className="flex items-center gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tous</option>
              <option value="client">Clients</option>
              <option value="vendor">Vendeurs</option>
              <option value="admin">Admins</option>
              {isSuperAdmin && <option value="super_admin">Super Admins</option>}
            </select>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <LayoutGrid size={20} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List size={20} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
            </div>
            <button onClick={loadUsers} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">
              <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid/List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => {
            const roleInfo = getRoleInfo(user)
            return (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className={`h-16 bg-gradient-to-r ${roleInfo.color}`}></div>
                <div className="p-4 -mt-8">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 mx-auto border-4 border-white">
                    {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                    {(user.last_name?.[0] || '').toUpperCase()}
                  </div>
                  <div className="text-center mt-3">
                    <h3 className="font-semibold text-gray-900">
                      {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.bg}`}>
                        <roleInfo.icon size={12} />
                        {roleInfo.label}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEditUsers() && (
                      <button onClick={() => handleEditUser(user)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canEditUsers() && (
                      <button onClick={() => handleToggleActive(user)} className={`p-2 rounded-lg ${user.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={user.is_active ? 'Désactiver' : 'Activer'}>
                        <Ban size={16} />
                      </button>
                    )}
                    {canDeleteUsers() && (
                      <button onClick={() => handleDeleteClick(user)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Utilisateur</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rôle</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user)
                return (
                  <tr key={user.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-white font-bold text-sm`}>
                          {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                          </p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.bg}`}>
                        <roleInfo.icon size={12} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${user.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100">
                        {canEditUsers() && (
                          <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg" title="Modifier">
                            <Edit2 size={18} />
                          </button>
                        )}
                        {canDeleteUsers() && (
                          <button onClick={() => handleDeleteClick(user)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg" title="Supprimer">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 text-sm font-bold text-gray-900">Page {currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                <p className="text-sm text-gray-500 mt-1">Mise à jour des informations</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Rôles et Permissions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Compte actif</span>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                    <input
                      type="checkbox"
                      checked={formData.is_seller || false}
                      onChange={(e) => setFormData({ ...formData, is_seller: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Vendeur</span>
                  </label>
                  {isSuperAdmin && (
                    <>
                      <label className="flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          checked={formData.is_staff || false}
                          onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Admin</span>
                      </label>
                      <label className="flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          checked={formData.is_superuser || false}
                          onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Super Admin</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100" disabled={actionLoading}>
                Annuler
              </button>
              <button onClick={handleSaveUser} disabled={actionLoading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer l'utilisateur</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{userToDelete.username}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100" disabled={actionLoading}>
                Annuler
              </button>
              <button onClick={handleConfirmDelete} disabled={actionLoading} className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
