import React, { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, MapPin, Camera, Save, Loader2, Shield, Store,
  Eye, EyeOff, Lock, CheckCircle
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { authService } from '../../../lib/api/authService'
import { useToast } from '../../../components/Toast'

const AdminProfilePage: React.FC = () => {
  const { showToast } = useToast()
  const { user, loadUser } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        avatar: (user as any).avatar || ''
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      await authService.updateProfile(formData)
      await loadUser()
      showToast('Profil mis à jour avec succès!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('Les mots de passe ne correspondent pas', 'error')
      return
    }
    if (passwordData.new_password.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error')
      return
    }
    try {
      setSaving(true)
      await authService.changePassword(passwordData.current_password, passwordData.new_password)
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      showToast('Mot de passe modifié avec succès!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du changement de mot de passe', 'error')
    } finally {
      setSaving(false)
    }
  }

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user?.email?.substring(0, 2).toUpperCase() || 'AD'

  const displayRole = user?.is_superuser ? 'Super Admin' : user?.is_staff ? 'Administrateur' : 'Utilisateur'

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold shadow-xl">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-indigo-600 hover:bg-gray-50 transition-colors">
              <Camera size={18} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.username || 'Mon Profil'}
            </h1>
            <p className="text-white/80 mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                <Shield size={14} />
                {displayRole}
              </span>
              {user?.is_seller && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-lg text-sm font-medium">
                  <Store size={14} />
                  Vendeur
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Informations personnelles
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="Votre nom"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                placeholder="votre@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all resize-none"
                placeholder="Votre adresse complète"
              />
            </div>
            
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sécurité - Mot de passe */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Changer le mot de passe
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                placeholder="••••••••"
              />
              {passwordData.new_password && passwordData.confirm_password && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  passwordData.new_password === passwordData.confirm_password 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {passwordData.new_password === passwordData.confirm_password ? (
                    <>
                      <CheckCircle size={14} />
                      Les mots de passe correspondent
                    </>
                  ) : (
                    'Les mots de passe ne correspondent pas'
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Conseils pour un mot de passe sécurisé:</strong>
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Au moins 8 caractères</li>
                <li>• Mélange de lettres majuscules et minuscules</li>
                <li>• Au moins un chiffre et un caractère spécial</li>
              </ul>
            </div>
            
            <button
              onClick={handleChangePassword}
              disabled={saving || !passwordData.current_password || !passwordData.new_password}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Modifier le mot de passe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfilePage
