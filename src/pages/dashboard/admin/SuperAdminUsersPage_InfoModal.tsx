import React, { useState, useEffect } from 'react'
import { X, Store, Mail, Phone, Calendar, Shield, ShieldCheck, User as UserIcon, Edit2, Save, Bell, MessageSquare, Key, Ban, CheckCircle, Trash2 } from 'lucide-react'
import { UserData } from '../../../lib/api/usersService'

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserData | null
  userShop: any
  loadingShop: boolean
  onSave: (userId: string, data: Partial<UserData>) => Promise<void>
  onToggleActive: (user: UserData) => void
  onToggleSeller: (user: UserData) => void
  onResetPassword: (user: UserData) => void
  onSendNotification: (user: UserData) => void
  onSendMessage: (user: UserData) => void
  onDelete: (user: UserData) => void
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  userShop, 
  loadingShop,
  onSave,
  onToggleActive,
  onToggleSeller,
  onResetPassword,
  onSendNotification,
  onSendMessage,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      })
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(user.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  const getRoleBadge = () => {
    if (user.is_superuser) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <ShieldCheck size={16} />
          Super Admin
        </span>
      )
    }
    if (user.is_staff) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Shield size={16} />
          Admin
        </span>
      )
    }
    if (user.is_seller) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Store size={16} />
          Vendeur
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <UserIcon size={16} />
        Client
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {user.first_name?.charAt(0) || user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </h2>
                <p className="text-white/80 text-sm mt-1">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="mt-4">
            {getRoleBadge()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleAction(() => onToggleActive(user))}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all"
              >
                {user.is_active ? <Ban size={24} className="text-indigo-600" /> : <CheckCircle size={24} className="text-indigo-600" />}
                <span className="text-xs font-medium text-indigo-900">{user.is_active ? 'Désactiver' : 'Activer'}</span>
              </button>
              <button
                onClick={() => handleAction(() => onToggleSeller(user))}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all"
              >
                <Store size={24} className="text-green-600" />
                <span className="text-xs font-medium text-green-900">{user.is_seller ? 'Retirer vendeur' : 'Rendre vendeur'}</span>
              </button>
              <button
                onClick={() => handleAction(() => onResetPassword(user))}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all"
              >
                <Key size={24} className="text-orange-600" />
                <span className="text-xs font-medium text-orange-900">Mot de passe</span>
              </button>
              <button
                onClick={() => handleAction(() => onSendNotification(user))}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all"
              >
                <Bell size={24} className="text-purple-600" />
                <span className="text-xs font-medium text-purple-900">Notification</span>
              </button>
              <button
                onClick={() => handleAction(() => onSendMessage(user))}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 rounded-xl transition-all"
              >
                <MessageSquare size={24} className="text-cyan-600" />
                <span className="text-xs font-medium text-cyan-900">Message</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all"
              >
                <Edit2 size={24} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-900">Modifier</span>
              </button>
              <button
                onClick={() => handleAction(() => onDelete(user))}
                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all"
              >
                <Trash2 size={24} className="text-red-600" />
                <span className="text-xs font-medium text-red-900">Supprimer</span>
              </button>
            </div>
          </div>
          {/* Basic Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <UserIcon className="text-gray-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Prénom</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{user.first_name || 'Non défini'}</p>
                  )}
                </div>
              </div>
              {/* Last Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <UserIcon className="text-gray-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Nom</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{user.last_name || 'Non défini'}</p>
                  )}
                </div>
              </div>
              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="text-gray-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{user.email || 'Non défini'}</p>
                  )}
                </div>
              </div>
              {/* Phone */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="text-gray-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Téléphone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{user.phone || 'Non défini'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Inscription</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(user.date_joined).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Dernière connexion</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut du compte</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-2">Statut</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-2">ID Utilisateur</p>
                <p className="text-sm text-gray-900 font-mono">{user.id.substring(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Vendor Shop Info */}
          {user.is_seller && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Boutique du vendeur</h3>
              {loadingShop ? (
                <div className="p-8 bg-gray-50 rounded-xl text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : userShop ? (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Store className="text-green-600 mt-1" size={24} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{userShop.name}</h4>
                      {userShop.description && (
                        <p className="text-sm text-gray-600 mt-1">{userShop.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          userShop.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userShop.is_verified ? 'Vérifiée' : 'Non vérifiée'}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          userShop.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userShop.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <Store className="text-yellow-600 mx-auto mb-2" size={32} />
                  <p className="text-sm text-yellow-800 font-medium">Aucune boutique trouvée</p>
                  <p className="text-xs text-yellow-600 mt-1">Ce vendeur n'a pas encore créé de boutique</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
