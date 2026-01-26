import React, { useState } from 'react'
import { 
  Settings, Save, Bell, Globe, CreditCard, Truck, Shield, 
  Mail, Phone, MapPin, Image, Palette, ToggleLeft, ToggleRight
} from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  icon: React.ReactNode
}

const SuperAdminSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // General Settings
  const [siteName, setSiteName] = useState('BuyMore')
  const [siteDescription, setSiteDescription] = useState('La marketplace #1 au Mali')
  const [contactEmail, setContactEmail] = useState('contact@buymore.ml')
  const [contactPhone, setContactPhone] = useState('+223 70 00 00 00')
  const [address, setAddress] = useState('Bamako, Mali')

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Payments
  const [orangeMoney, setOrangeMoney] = useState(true)
  const [wave, setWave] = useState(true)
  const [moovMoney, setMoovMoney] = useState(true)
  const [cashOnDelivery, setCashOnDelivery] = useState(true)

  // Delivery
  const [deliveryFee, setDeliveryFee] = useState('1000')
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('25000')
  const [deliveryZones, setDeliveryZones] = useState('Bamako, Sikasso, Ségou, Mopti')

  const sections: SettingSection[] = [
    { id: 'general', title: 'Général', icon: <Settings size={18} /> },
    { id: 'notifications', title: 'Notifications', icon: <Bell size={18} /> },
    { id: 'payments', title: 'Paiements', icon: <CreditCard size={18} /> },
    { id: 'delivery', title: 'Livraison', icon: <Truck size={18} /> },
    { id: 'security', title: 'Sécurité', icon: <Shield size={18} /> },
  ]

  const handleSave = async () => {
    setSaving(true)
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Configuration de la plateforme BuyMore</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`mt-4 md:mt-0 flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Enregistrement...
            </>
          ) : saved ? (
            <>
              <Save size={18} />
              Enregistré !
            </>
          ) : (
            <>
              <Save size={18} />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {section.icon}
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Paramètres Généraux</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe size={16} className="inline mr-2" />
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du site
                  </label>
                  <textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Apparence</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">Couleur principale:</span>
                    </div>
                    <div className="flex gap-2">
                      {['#1a4d2e', '#2563eb', '#7c3aed', '#dc2626', '#ea580c'].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Paramètres de Notifications</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                  </div>
                  <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifications SMS</p>
                    <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
                  </div>
                  <Toggle enabled={smsNotifications} onChange={setSmsNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Alertes commandes</p>
                    <p className="text-sm text-gray-500">Être notifié pour chaque nouvelle commande</p>
                  </div>
                  <Toggle enabled={orderNotifications} onChange={setOrderNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Emails marketing</p>
                    <p className="text-sm text-gray-500">Recevoir les offres et promotions</p>
                  </div>
                  <Toggle enabled={marketingEmails} onChange={setMarketingEmails} />
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeSection === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Méthodes de Paiement</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🟠</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Orange Money</p>
                      <p className="text-sm text-gray-500">Paiement mobile Orange</p>
                    </div>
                  </div>
                  <Toggle enabled={orangeMoney} onChange={setOrangeMoney} />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🌊</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Wave</p>
                      <p className="text-sm text-gray-500">Paiement mobile Wave</p>
                    </div>
                  </div>
                  <Toggle enabled={wave} onChange={setWave} />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Moov Money</p>
                      <p className="text-sm text-gray-500">Paiement mobile Moov</p>
                    </div>
                  </div>
                  <Toggle enabled={moovMoney} onChange={setMoovMoney} />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💵</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Paiement à la livraison</p>
                      <p className="text-sm text-gray-500">Espèces à la réception</p>
                    </div>
                  </div>
                  <Toggle enabled={cashOnDelivery} onChange={setCashOnDelivery} />
                </div>
              </div>
            </div>
          )}

          {/* Delivery */}
          {activeSection === 'delivery' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Paramètres de Livraison</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frais de livraison (FCFA)
                    </label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seuil livraison gratuite (FCFA)
                    </label>
                    <input
                      type="number"
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zones de livraison
                  </label>
                  <textarea
                    value={deliveryZones}
                    onChange={(e) => setDeliveryZones(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Séparez les zones par des virgules"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Les frais de livraison peuvent être personnalisés par zone. 
                    Contactez le support technique pour configurer des tarifs différenciés.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Paramètres de Sécurité</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-500">Exiger 2FA pour les admins</p>
                  </div>
                  <Toggle enabled={true} onChange={() => {}} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Verrouillage après échecs</p>
                    <p className="text-sm text-gray-500">Bloquer après 5 tentatives échouées</p>
                  </div>
                  <Toggle enabled={true} onChange={() => {}} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sessions multiples</p>
                    <p className="text-sm text-gray-500">Autoriser plusieurs connexions simultanées</p>
                  </div>
                  <Toggle enabled={false} onChange={() => {}} />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Actions de sécurité</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors">
                      Forcer déconnexion globale
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">
                      Réinitialiser tous les mots de passe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminSettingsPage
