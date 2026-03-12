import React, { useState, useEffect } from 'react'
import { Settings, Lock, Bell, Shield, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '../../../components/Toast'
import { apiClient } from '../../../lib/api/apiClient'

const SettingsPage: React.FC = () => {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'security' | 'notifications'>('security')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_orders: true,
    email_promotions: false,
    email_messages: true,
    push_orders: true,
    push_promotions: false,
    push_messages: true,
  })

  // Charger les préférences de notification depuis le profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true)
        const response = await apiClient.get<any>('/api/customers/profile')
        if (response.data) {
          setNotificationSettings({
            email_orders: response.data.notification_email_orders !== false,
            email_promotions: response.data.notification_email_promotions === true,
            email_messages: response.data.notification_email_messages !== false,
            push_orders: response.data.notification_push_orders !== false,
            push_promotions: response.data.notification_push_promotions === true,
            push_messages: response.data.notification_push_messages !== false,
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('Les mots de passe ne correspondent pas', 'error')
      return
    }

    if (passwordData.new_password.length < 6) {
      showToast('Le mot de passe doit contenir au moins 6 caractères', 'error')
      return
    }

    try {
      setPasswordLoading(true)
      await apiClient.post('/api/customers/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      showToast('Mot de passe modifié avec succès', 'success')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error: any) {
      showToast(error.message || 'Erreur lors du changement de mot de passe', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleNotificationSave = async () => {
    try {
      setNotificationLoading(true)
      await apiClient.patch('/api/customers/profile', {
        notification_email_orders: notificationSettings.email_orders,
        notification_email_promotions: notificationSettings.email_promotions,
        notification_email_messages: notificationSettings.email_messages,
        notification_push_orders: notificationSettings.push_orders,
        notification_push_promotions: notificationSettings.push_promotions,
        notification_push_messages: notificationSettings.push_messages,
      })
      showToast('Préférences de notification enregistrées', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de l\'enregistrement', 'error')
    } finally {
      setNotificationLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-green-600" />
          Paramètres
        </h1>
        <p className="text-gray-600 mt-1">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="inline mr-2" size={18} />
              Sécurité
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="inline mr-2" size={18} />
              Notifications
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Modifier le mot de passe</h2>
              <form onSubmit={handlePasswordChange} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current_password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, new_password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm_password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                  Modifier le mot de passe
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Shield className="text-green-600" />
                  Authentification à deux facteurs
                </h2>
                <p className="text-gray-600 mb-4">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Activer 2FA
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Préférences de notification</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications par email</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Commandes</p>
                        <p className="text-sm text-gray-600">
                          Recevoir des emails concernant vos commandes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_orders}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_orders: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Promotions</p>
                        <p className="text-sm text-gray-600">
                          Recevoir des emails sur les promotions et offres
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_promotions}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_promotions: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Messages</p>
                        <p className="text-sm text-gray-600">
                          Recevoir des notifications des vendeurs
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_messages}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_messages: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications push</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Commandes</p>
                        <p className="text-sm text-gray-600">
                          Notifications push pour vos commandes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_orders}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            push_orders: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Promotions</p>
                        <p className="text-sm text-gray-600">
                          Notifications push pour les promotions
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_promotions}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            push_promotions: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Messages</p>
                        <p className="text-sm text-gray-600">
                          Notifications push pour les messages
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_messages}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            push_messages: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleNotificationSave}
                  disabled={notificationLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {notificationLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default SettingsPage
