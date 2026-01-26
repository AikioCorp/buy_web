import React from 'react'
import { Save, UserCircle, Store, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const SettingsPage: React.FC = () => {
  const { user, role } = useAuthStore()
  const isVendor = role === 'vendor'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="flex border-b">
          <button className="px-4 py-3 text-sm font-medium border-b-2 border-green-600 text-green-600">
            Profil
          </button>
          {isVendor && (
            <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              Boutique
            </button>
          )}
          <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
            Sécurité
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <UserCircle size={64} className="text-gray-400" />
                </div>
                <button className="px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200">
                  Changer la photo
                </button>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      defaultValue={user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      defaultValue=""
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      defaultValue={user?.phone || ''}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    // Note: address n'est pas dans le type User
                    defaultValue=""
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                  >
                    <Save size={18} />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {isVendor && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6 p-6">
          <div className="flex items-center mb-4">
            <Store size={24} className="text-gray-700 mr-2" />
            <h2 className="text-lg font-bold">Informations de la boutique</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Pour modifier les informations de votre boutique, accédez à l'onglet "Boutique" dans les paramètres.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <div className="flex items-center mb-4">
          <Lock size={24} className="text-gray-700 mr-2" />
          <h2 className="text-lg font-bold">Sécurité du compte</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Pour modifier votre mot de passe ou les paramètres de sécurité, accédez à l'onglet "Sécurité" dans les paramètres.
        </p>
      </div>
    </div>
  )
}

export default SettingsPage
