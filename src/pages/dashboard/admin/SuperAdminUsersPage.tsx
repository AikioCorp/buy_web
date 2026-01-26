import React, { useState, useEffect } from 'react'
import { Search, UserPlus, Edit2, Trash2, Shield, ShieldCheck, Store, User as UserIcon, X, Save, Key } from 'lucide-react'
import { usersService, UserData, CreateUserData } from '../../../lib/api/usersService'

const SuperAdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'client' | 'vendor' | 'admin' | 'super_admin'>('all')
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [userToResetPassword, setUserToResetPassword] = useState<UserData | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<Partial<UserData>>({})
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_seller: false,
    is_staff: false,
    is_superuser: false,
    is_active: true
  })
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

      console.log('API Response:', response)

      if (response.data) {
        // L'API peut retourner directement un tableau ou un objet paginé
        if (Array.isArray(response.data)) {
          setUsers(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setUsers(response.data.results)
          setTotalCount(response.data.count)
        } else {
          // Si la réponse est un objet avec les utilisateurs directement
          console.log('Format de réponse inattendu:', response.data)
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
      alert(err.message || 'Erreur lors de la mise à jour de l\'utilisateur')
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
      alert(err.message || 'Erreur lors de la suppression de l\'utilisateur')
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

  const handleToggleSeller = async (user: UserData) => {
    try {
      await usersService.updateUser(user.id, { is_seller: !user.is_seller })
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la modification du rôle')
    }
  }

  const handleOpenResetPassword = (user: UserData) => {
    setUserToResetPassword(user)
    setNewPassword('')
    setIsResetPasswordModalOpen(true)
  }

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return
    
    if (newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    try {
      setActionLoading(true)
      await usersService.resetPassword(userToResetPassword.id, newPassword)
      setIsResetPasswordModalOpen(false)
      setUserToResetPassword(null)
      setNewPassword('')
      alert('Mot de passe réinitialisé avec succès!')
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la réinitialisation du mot de passe')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateUser = () => {
    setCreateFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      is_seller: false,
      is_staff: false,
      is_superuser: false,
      is_active: true
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveNewUser = async () => {
    if (!createFormData.username || !createFormData.email || !createFormData.password) {
      alert('Veuillez remplir tous les champs obligatoires (username, email, password)')
      return
    }
    
    try {
      setActionLoading(true)
      await usersService.createUser(createFormData)
      setIsCreateModalOpen(false)
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de l\'utilisateur')
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadge = (user: UserData) => {
    if (user.is_superuser) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <ShieldCheck size={12} />
          Super Admin
        </span>
      )
    }
    if (user.is_staff) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Shield size={12} />
          Admin
        </span>
      )
    }
    if (user.is_seller) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Store size={12} />
          Vendeur
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <UserIcon size={12} />
        Client
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredUsers = selectedFilter === 'all' 
    ? (users || [])
    : (users || []).filter(user => {
        if (selectedFilter === 'super_admin') return user.is_superuser
        if (selectedFilter === 'admin') return user.is_staff && !user.is_superuser
        if (selectedFilter === 'vendor') return user.is_seller
        if (selectedFilter === 'client') return !user.is_seller && !user.is_staff && !user.is_superuser
        return true
      })

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} utilisateur{totalCount > 1 ? 's' : ''} au total
          </p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <UserPlus size={18} />
          Nouvel Utilisateur
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, email, username..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendeur</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.date_joined)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? formatDate(user.last_login) : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active/Suspend */}
                          <button 
                            onClick={() => handleToggleActive(user)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.is_active 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={user.is_active ? 'Suspendre' : 'Activer'}
                          >
                            {user.is_active ? 'Suspendre' : 'Activer'}
                          </button>
                          {/* Toggle Seller */}
                          <button 
                            onClick={() => handleToggleSeller(user)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.is_seller 
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={user.is_seller ? 'Retirer vendeur' : 'Rendre vendeur'}
                          >
                            {user.is_seller ? '→ Client' : '→ Vendeur'}
                          </button>
                          <button 
                            onClick={() => handleOpenResetPassword(user)}
                            className="p-1 text-orange-600 hover:text-orange-900"
                            title="Réinitialiser mot de passe"
                          >
                            <Key size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user)}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Modifier l'utilisateur</h2>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rôles et Permissions</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Compte actif</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_seller || false}
                  onChange={(e) => setFormData({ ...formData, is_seller: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Vendeur</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_staff || false}
                  onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Staff / Admin</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_superuser || false}
                  onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Super Admin</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={actionLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleSaveUser}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Create User Modal */}
  {isCreateModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Créer un nouvel utilisateur</h2>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createFormData.username}
                onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={createFormData.first_name}
                onChange={(e) => setCreateFormData({ ...createFormData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={createFormData.last_name}
                onChange={(e) => setCreateFormData({ ...createFormData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="text"
              value={createFormData.phone}
              onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+223 XX XX XX XX"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rôles et Permissions</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createFormData.is_active}
                  onChange={(e) => setCreateFormData({ ...createFormData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Compte actif</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createFormData.is_seller}
                  onChange={(e) => setCreateFormData({ ...createFormData, is_seller: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Vendeur</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createFormData.is_staff}
                  onChange={(e) => setCreateFormData({ ...createFormData, is_staff: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Staff / Admin</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createFormData.is_superuser}
                  onChange={(e) => setCreateFormData({ ...createFormData, is_superuser: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Super Admin</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={actionLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleSaveNewUser}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Création...
              </>
            ) : (
              <>
                <Save size={16} />
                Créer l'utilisateur
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Delete Confirmation Modal */}
  {isDeleteModalOpen && userToDelete && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Supprimer l'utilisateur</h2>
              <p className="text-sm text-gray-600">Cette action est irréversible</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.username}</strong> ({userToDelete.email}) ?
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Suppression...
                </div>
              ) : (
                'Supprimer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Reset Password Modal */}
  {isResetPasswordModalOpen && userToResetPassword && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Key size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
              <p className="text-sm text-gray-600">{userToResetPassword.username} ({userToResetPassword.email})</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setIsResetPasswordModalOpen(false)
                setUserToResetPassword(null)
                setNewPassword('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleResetPassword}
              disabled={actionLoading || newPassword.length < 8}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Réinitialisation...
                </div>
              ) : (
                'Réinitialiser'
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

export default SuperAdminUsersPage
