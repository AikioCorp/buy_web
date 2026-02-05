import React, { useState } from 'react'
import { Settings, Lock, Bell, Globe, Shield, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../../../components/Toast'

const SettingsPage: React.FC = () => {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'preferences'>('security')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

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

  const [preferences, setPreferences] = useState({
    language: 'fr',
    currency: 'XOF',
    theme: 'light',
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('Les mots de passe ne correspondent pas', 'error')
      return
    }

    showToast('Mot de passe modifié avec succès', 'success')
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
  }

  const handleNotificationSave = () => {
    showToast('Préférences de notification enregistrées', 'success')
  }

  const handlePreferencesSave = () => {
    showToast('Préférences enregistrées', 'success')
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
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="inline mr-2" size={18} />
              Préférences
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Préférences générales</h2>

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="XOF">Franc CFA (XOF)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>

                <button
                  onClick={handlePreferencesSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
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
