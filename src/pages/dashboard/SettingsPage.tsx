import React, { useState, useRef, useEffect } from 'react'
import { Save, UserCircle, Store, Lock, Upload } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import { apiClient } from '@/lib/api/apiClient'

const SettingsPage: React.FC = () => {
  const { user, role } = useAuthStore()
  const { showToast } = useToast()
  const isVendor = role === 'vendor'
  const [activeTab, setActiveTab] = useState<'profile' | 'shop' | 'security'>('profile')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    street: '',
    city: ''
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<any>('/api/auth/me')
      if (response.data) {
        const userData = response.data
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          street: userData.street || '',
          city: userData.city || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('La photo ne doit pas dépasser 5 MB', 'error')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        showToast('Photo chargée avec succès', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await apiClient.patch('/api/customers/profile', formData)
      if (response.data) {
        showToast('Profil mis à jour avec succès', 'success')
        loadUserProfile()
      }
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la mise à jour', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error')
      return
    }

    if (newPassword.length < 6) {
      showToast('Le mot de passe doit contenir au moins 6 caractères', 'error')
      return
    }

    try {
      setLoading(true)
      await apiClient.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      showToast('Mot de passe modifié avec succès', 'success')
      form.reset()
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors du changement de mot de passe', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profil
          </button>
          {isVendor && (
            <button 
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'shop' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Boutique
            </button>
          )}
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'security' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sécurité
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={64} className="text-gray-400" />
                    )}
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Changer la photo
                  </button>
                </div>
              </div>
            
              <div className="md:w-2/3">
                <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      value={formData.email}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+223 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      defaultValue={role === 'vendor' ? 'Vendeur' : 'Client'}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    name="street"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={formData.street}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                      disabled={loading}
                    >
                      <Save size={18} />
                      <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'shop' && isVendor && (
            <div>
              <div className="flex items-center mb-6">
                <Store size={24} className="text-gray-700 mr-2" />
                <h2 className="text-lg font-bold">Informations de la boutique</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Les informations de votre boutique sont gérées dans la section <strong>Ma Boutique</strong>. Accédez-y via le menu principal pour modifier le nom, la description, le logo et les zones de livraison.
              </p>

              <a 
                href="/dashboard/store" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Store size={18} />
                Aller à Ma Boutique
              </a>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="flex items-center mb-6">
                <Lock size={24} className="text-gray-700 mr-2" />
                <h2 className="text-lg font-bold">Sécurité du compte</h2>
              </div>
              
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Entrez votre mot de passe actuel"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Entrez un nouveau mot de passe"
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Confirmez le nouveau mot de passe"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                    disabled={loading}
                  >
                    <Save size={18} />
                    <span>{loading ? 'Modification...' : 'Changer le mot de passe'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
