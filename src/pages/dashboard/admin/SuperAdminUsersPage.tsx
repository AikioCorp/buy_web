import React, { useState, useEffect } from 'react'
import { Search, UserPlus, Edit2, Trash2, Shield, ShieldCheck, Store, User as UserIcon, X, Save, Key, LayoutGrid, List, Filter, Bell, Send, Eye, EyeOff, Copy, RefreshCcw, Mail } from 'lucide-react'
import { usersService, UserData, CreateUserData } from '../../../lib/api/usersService'
import { notificationsService } from '../../../lib/api/notificationsService'
import { messagesService } from '../../../lib/api/messagesService'
import { MessageSquare } from 'lucide-react'
import { useToast } from '../../../components/Toast'
import { useConfirm } from '../../../components/ConfirmModal'

const SuperAdminUsersPage: React.FC = () => {
  const { showToast } = useToast()
  const { confirm, alert: showAlert } = useConfirm()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'client' | 'vendor' | 'admin' | 'super_admin'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid') // Nouveau mode de vue
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [userToResetPassword, setUserToResetPassword] = useState<UserData | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sendByEmail, setSendByEmail] = useState(false)
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
  
  // Notification state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false)
  const [userToNotify, setUserToNotify] = useState<UserData | null>(null)
  const [notifData, setNotifData] = useState({ title: '', content: '', type: 'info' as 'info' | 'promotion' | 'system' })
  const [notifSending, setNotifSending] = useState(false)

  // Message state
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false)
  const [userToMessage, setUserToMessage] = useState<UserData | null>(null)
  const [msgContent, setMsgContent] = useState('')
  const [msgSending, setMsgSending] = useState(false)

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
      console.log('Updating user:', editingUser.id, 'with data:', formData)
      const response = await usersService.updateUser(editingUser.id, formData)
      console.log('Update response:', response)
      setIsEditModalOpen(false)
      setEditingUser(null)
      await loadUsers()
      showToast('Utilisateur mis à jour avec succès!', 'success')
    } catch (err: any) {
      console.error('Update error:', err)
      showToast(err.message || 'Erreur lors de la mise à jour de l\'utilisateur', 'error')
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
      showToast('Utilisateur supprimé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression de l\'utilisateur', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (user: UserData) => {
    try {
      await usersService.updateUser(user.id, { is_active: !user.is_active })
      loadUsers()
      showToast('Statut modifié avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la modification du statut', 'error')
    }
  }

  const handleToggleSeller = async (user: UserData) => {
    try {
      await usersService.updateUser(user.id, { is_seller: !user.is_seller })
      loadUsers()
      showToast('Rôle modifié avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la modification du rôle', 'error')
    }
  }

  const handleOpenResetPassword = (user: UserData) => {
    setUserToResetPassword(user)
    setNewPassword('')
    setShowPassword(false)
    setIsResetPasswordModalOpen(true)
  }

  const generatePassword = (length: number = 12): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  const handleGeneratePassword = () => {
    const generated = generatePassword(12)
    setNewPassword(generated)
    setShowPassword(true)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword)
    showToast('Mot de passe copié!', 'success')
  }

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return

    if (newPassword.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error')
      return
    }

    try {
      setActionLoading(true)
      
      if (sendByEmail) {
        // Envoyer un lien de réinitialisation par email
        await usersService.sendPasswordResetLink(userToResetPassword.id)
        showToast('Lien de réinitialisation envoyé par email!', 'success')
      } else {
        // Réinitialiser directement avec le nouveau mot de passe
        await usersService.resetPassword(userToResetPassword.id, newPassword)
        showToast('Mot de passe réinitialisé avec succès!', 'success')
      }
      
      setIsResetPasswordModalOpen(false)
      setUserToResetPassword(null)
      setNewPassword('')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la réinitialisation du mot de passe', 'error')
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
      showToast('Veuillez remplir tous les champs obligatoires (username, email, password)', 'error')
      return
    }

    try {
      setActionLoading(true)
      await usersService.createUser(createFormData)
      setIsCreateModalOpen(false)
      loadUsers()
      showToast('Utilisateur créé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de l\'utilisateur', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenNotifModal = (user: UserData) => {
    setUserToNotify(user)
    setNotifData({ title: '', content: '', type: 'info' })
    setIsNotifModalOpen(true)
  }

  const handleSendNotification = async () => {
    if (!userToNotify || !notifData.title.trim() || !notifData.content.trim()) {
      showToast('Veuillez remplir le titre et le contenu', 'error')
      return
    }

    try {
      setNotifSending(true)
      await notificationsService.sendToUser(userToNotify.id, {
        title: notifData.title,
        content: notifData.content,
        type: notifData.type
      })
      showToast('Notification envoyée avec succès !', 'success')
      setIsNotifModalOpen(false)
      setUserToNotify(null)
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error')
    } finally {
      setNotifSending(false)
    }
  }

  const handleOpenMsgModal = (user: UserData) => {
    setUserToMessage(user)
    setMsgContent('')
    setIsMsgModalOpen(true)
  }

  const handleSendMessage = async () => {
    if (!userToMessage || !msgContent.trim()) {
      showToast('Veuillez écrire un message', 'error')
      return
    }

    try {
      setMsgSending(true)
      // Optimized: single API call to create conversation and send message
      await messagesService.sendDirectToUser(userToMessage.id, msgContent)
      showToast('Message envoyé avec succès !', 'success')
      setIsMsgModalOpen(false)
      setUserToMessage(null)
      setMsgContent('')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error')
    } finally {
      setMsgSending(false)
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive
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

  // Calculs pour les stats rapides
  const activeUsersCount = users.filter(u => u.is_active).length
  const vendorsCount = users.filter(u => u.is_seller).length
  const adminsCount = users.filter(u => u.is_staff || u.is_superuser).length

  // Helper pour les couleurs de rôle
  const getRoleColor = (user: UserData) => {
    if (user.is_superuser) return 'from-purple-500 to-indigo-600'
    if (user.is_staff) return 'from-red-500 to-orange-500'
    if (user.is_seller) return 'from-blue-500 to-cyan-500'
    return 'from-gray-500 to-gray-600'
  }

  const getRoleLabel = (user: UserData) => {
    if (user.is_superuser) return { icon: ShieldCheck, label: 'Super Admin', bg: 'bg-purple-50 text-purple-700' }
    if (user.is_staff) return { icon: Shield, label: 'Admin', bg: 'bg-red-50 text-red-700' }
    if (user.is_seller) return { icon: Store, label: 'Vendeur', bg: 'bg-blue-50 text-blue-700' }
    return { icon: UserIcon, label: 'Client', bg: 'bg-gray-50 text-gray-700' }
  }

  return (
    <div className="space-y-8 min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8 font-sans">

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            Utilisateurs
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Gérez l'accès et les permissions de votre écosystème.
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="group flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
            <UserPlus size={20} />
          </div>
          <span className="font-bold tracking-wide">Créer un utilisateur</span>
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: UserIcon, label: "Total Utilisateurs", value: totalCount, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: ShieldCheck, label: "Comptes Actifs", value: activeUsersCount, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Store, label: "Vendeurs", value: vendorsCount, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Shield, label: "Administrateurs", value: adminsCount, color: "text-purple-600", bg: "bg-purple-50" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- TOOLBAR SECTION --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 sm:p-3">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">

          {/* Search Bar */}
          <div className="w-full xl:max-w-md relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-12 pr-4 py-3.5 w-full bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Filter Tabs */}
            <div className="flex p-1.5 bg-gray-100/80 rounded-2xl w-full sm:w-auto overflow-x-auto">
              {(['all', 'client', 'vendor', 'admin'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter as any)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedFilter === filter
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                  {filter === 'all' && 'Tous'}
                  {filter === 'client' && 'Clients'}
                  {filter === 'vendor' && 'Vendeurs'}
                  {filter === 'admin' && 'Admins'}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

            {/* View Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-8 text-gray-400 font-medium tracking-wide">Chargement de l'espace...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="p-6 bg-gray-50 rounded-full text-gray-300 mb-4">
            <UserIcon size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Aucun résultat</h3>
          <p className="text-gray-400 mt-2">Essayez de modifier vos filtres</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const roleInfo = getRoleLabel(user)
            const gradient = getRoleColor(user)

            return (
              <div key={user.id} className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden">
                {/* Header Gradient */}
                <div className={`h-24 bg-gradient-to-r ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                {/* Main Content */}
                <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg mb-4">
                    <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center text-3xl font-black text-gray-800 uppercase tracking-tighter">
                      {user.username?.substring(0, 2) || 'UK'}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 text-center">{user.username}</h3>
                  <p className="text-sm font-medium text-gray-400 text-center mb-4">{user.email}</p>

                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleInfo.bg} mb-6 flex items-center gap-2`}>
                    <roleInfo.icon size={14} />
                    {roleInfo.label}
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-semibold text-gray-500 py-4 border-t border-gray-100">
                    <div>
                      <p className="text-gray-300 mb-1">STATUT</p>
                      <span className={user.is_active ? 'text-green-600' : 'text-red-500'}>
                        {user.is_active ? 'Actif' : 'Suspendu'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-300 mb-1">JOINED</p>
                      <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions Overlay (Glassmorphism) */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-2 flex justify-around items-center">
                      <button onClick={() => handleToggleActive(user)} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Statut">
                        {user.is_active ? <X size={20} /> : <ShieldCheck size={20} />}
                      </button>
                      <button onClick={() => handleToggleSeller(user)} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Vendeur">
                        <Store size={20} />
                      </button>
                      <button onClick={() => handleOpenResetPassword(user)} className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors" title="Password">
                        <Key size={20} />
                      </button>
                      <button onClick={() => handleOpenNotifModal(user)} className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors" title="Envoyer notification">
                        <Bell size={20} />
                      </button>
                      <button onClick={() => handleOpenMsgModal(user)} className="p-2.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors" title="Envoyer message">
                        <MessageSquare size={20} />
                      </button>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <button onClick={() => handleEditUser(user)} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Editer">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => handleDeleteClick(user)} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* --- LIST VIEW (Optimized) --- */
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Activité</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleLabel(user)
                return (
                  <tr key={user.id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="pl-8 py-4 whitespace-nowrap w-16">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {user.username?.substring(0, 1)}
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${roleInfo.bg}`}>
                        <roleInfo.icon size={12} />
                        {roleInfo.label}
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 text-sm font-medium ${user.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Jamais'}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenNotifModal(user)} className="p-2 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg" title="Notification">
                          <Bell size={18} />
                        </button>
                        <button onClick={() => handleOpenMsgModal(user)} className="p-2 hover:bg-cyan-50 text-gray-400 hover:text-cyan-600 rounded-lg" title="Message">
                          <MessageSquare size={18} />
                        </button>
                        <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(user)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 hover:bg-gray-50 rounded-xl text-sm font-medium disabled:opacity-50">Précédent</button>
            <span className="px-4 text-sm font-bold text-gray-900">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 hover:bg-gray-50 rounded-xl text-sm font-medium disabled:opacity-50">Suivant</button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 transition-all">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                <p className="text-sm text-gray-500 mt-1">Mise à jour des informations et permissions</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Rôles et Permissions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Compte actif</span>
                      <span className="block text-xs text-gray-500">L'utilisateur peut se connecter</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_seller || false}
                      onChange={(e) => setFormData({ ...formData, is_seller: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Vendeur</span>
                      <span className="block text-xs text-gray-500">Accès au dashboard vendeur</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_staff || false}
                      onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Staff / Admin</span>
                      <span className="block text-xs text-gray-500">Accès au back-office</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_superuser || false}
                      onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Super Admin</span>
                      <span className="block text-xs text-gray-500">Accès complet au système</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveUser}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-colors"
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
          </div >
        </div >
      )
      }

      {/* Create User Modal */}
      {
        isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Créer un nouvel utilisateur</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveNewUser}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 order-1 sm:order-2"
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
        )
      }

      {/* Delete Confirmation Modal */}
      {
        isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
        )
      }

      {/* Reset Password Modal */}
      {
        isResetPasswordModalOpen && userToResetPassword && (
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

                <div className="mb-6 space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {newPassword && (
                        <button 
                          type="button" 
                          onClick={handleCopyPassword}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                          title="Copier"
                        >
                          <Copy size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleGeneratePassword}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCcw size={16} />
                    Générer un mot de passe
                  </button>
                  <p className="text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                  
                  {/* Option envoi lien par email */}
                  <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={sendByEmail}
                      onChange={(e) => setSendByEmail(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Envoyer un lien de réinitialisation par email</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6">L'utilisateur pourra définir son propre mot de passe</span>
                    </div>
                  </label>
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
        )
      }

      {/* Notification Modal */}
      {isNotifModalOpen && userToNotify && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <div className="flex items-center gap-3">
                <Bell size={24} />
                <div>
                  <h2 className="text-xl font-bold">Envoyer une notification</h2>
                  <p className="text-white/80 text-sm">À {userToNotify.username || userToNotify.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  {[/* eslint-disable @typescript-eslint/no-explicit-any */
                    { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-700' },
                    { value: 'promotion', label: 'Promo', color: 'bg-orange-100 text-orange-700' },
                    { value: 'system', label: 'Système', color: 'bg-gray-100 text-gray-700' }
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setNotifData({ ...notifData, type: t.value as any })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        notifData.type === t.value
                          ? t.color + ' ring-2 ring-offset-2 ring-purple-300'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={notifData.title}
                  onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                  placeholder="Ex: Information importante"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={notifData.content}
                  onChange={(e) => setNotifData({ ...notifData, content: e.target.value })}
                  placeholder="Votre message..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-300 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => { setIsNotifModalOpen(false); setUserToNotify(null) }}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl"
                disabled={notifSending}
              >
                Annuler
              </button>
              <button
                onClick={handleSendNotification}
                disabled={notifSending || !notifData.title.trim() || !notifData.content.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {notifSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send size={18} />
                )}
                {notifSending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMsgModalOpen && userToMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              <div className="flex items-center gap-3">
                <MessageSquare size={24} />
                <div>
                  <h2 className="text-xl font-bold">Envoyer un message</h2>
                  <p className="text-white/80 text-sm">À {userToMessage.username || userToMessage.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Votre message..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => { setIsMsgModalOpen(false); setUserToMessage(null) }}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl"
                disabled={msgSending}
              >
                Annuler
              </button>
              <button
                onClick={handleSendMessage}
                disabled={msgSending || !msgContent.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {msgSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send size={18} />
                )}
                {msgSending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}
export default SuperAdminUsersPage
