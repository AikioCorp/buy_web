import React, { useState, useEffect } from 'react'
import { 
  Store, Save, MapPin, Mail, Phone, Globe, 
  Camera, CheckCircle, AlertCircle, Loader2, Eye,
  Facebook, Instagram, Twitter
} from 'lucide-react'
import { shopsService, Shop, CreateShopData } from '../../lib/api/shopsService'
import { BAMAKO_COMMUNES } from '../../lib/api/deliveryService'
import { DeliveryZonesManager } from '../../components/dashboard/DeliveryZonesManager'

const StorePage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<Shop | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    whatsapp: '',
    address_commune: '',
    address_quartier: '',
    address_details: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
  })
  
  const [deliveryZones, setDeliveryZones] = useState<any[]>([])
  
  // Quartiers disponibles en fonction de la commune sélectionnée
  const availableQuartiers = formData.address_commune 
    ? BAMAKO_COMMUNES[formData.address_commune] || []
    : []

  useEffect(() => {
    loadStore()
  }, [])

  const loadStore = async () => {
    try {
      setLoading(true)
      const response = await shopsService.getMyShop()
      if (response.data) {
        setStore(response.data)
        setFormData({
          name: response.data.name || '',
          slug: response.data.slug || '',
          description: response.data.description || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          whatsapp: response.data.whatsapp || '',
          address_commune: response.data.address_commune || '',
          address_quartier: response.data.address_quartier || '',
          address_details: response.data.address_details || '',
          website: '',
          facebook: '',
          instagram: '',
          twitter: '',
        })
        // Charger les zones de livraison si disponibles
        if (response.data.delivery_zones) {
          setDeliveryZones(response.data.delivery_zones)
        }
      }
    } catch (error) {
      console.error('Erreur chargement boutique:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name, 
      slug: store ? formData.slug : generateSlug(name) 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Le nom de la boutique est requis' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const data: CreateShopData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        address_commune: formData.address_commune,
        address_quartier: formData.address_quartier,
        address_details: formData.address_details,
      }

      if (store) {
        // Mise à jour
        const response = await shopsService.updateShop(store.id, data)
        if (response.data) {
          setStore(response.data)
          setMessage({ type: 'success', text: 'Boutique mise à jour avec succès!' })
        } else if (response.error) {
          setMessage({ type: 'error', text: response.error })
        }
      } else {
        // Création
        const response = await shopsService.createShop(data)
        if (response.data) {
          setStore(response.data)
          setMessage({ type: 'success', text: 'Boutique créée avec succès!' })
        } else if (response.error) {
          setMessage({ type: 'error', text: response.error })
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Une erreur est survenue' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {store ? 'Ma Boutique' : 'Créer ma boutique'}
        </h1>
        <p className="text-gray-500 mt-1">
          {store 
            ? 'Gérez les informations de votre boutique'
            : 'Configurez votre boutique pour commencer à vendre'
          }
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Store Preview Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
                {store?.logo ? (
                  <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <Store size={40} className="text-white/80" />
                )}
              </div>
              <button 
                type="button"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg hover:bg-gray-50"
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {formData.name || 'Nom de votre boutique'}
              </h2>
              <p className="text-emerald-100 mt-1">
                buymore.ml/shop/{formData.slug || 'votre-boutique'}
              </p>
              {store && (
                <div className="flex items-center gap-4 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    store.is_active 
                      ? 'bg-white/20 text-white' 
                      : 'bg-yellow-400/20 text-yellow-100'
                  }`}>
                    {store.is_active ? '● En ligne' : '○ En attente de validation'}
                  </span>
                  <a 
                    href={`/shops/${store.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-white/80 hover:text-white"
                  >
                    <Eye size={16} />
                    Voir ma boutique
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store size={20} className="text-emerald-600" />
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: TechStore Mali"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la boutique
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    buymore.ml/shop/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="ma-boutique"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Décrivez votre boutique et ce que vous vendez..."
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-emerald-600" />
              Coordonnées
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="contact@maboutique.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+223 70 12 34 56"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+223 70 12 34 56"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commune <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.address_commune}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address_commune: e.target.value,
                    address_quartier: '' 
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionnez votre commune</option>
                  {Object.keys(BAMAKO_COMMUNES).map((commune) => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quartier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.address_quartier}
                  onChange={(e) => setFormData({ ...formData, address_quartier: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  disabled={!formData.address_commune}
                >
                  <option value="">Sélectionnez votre quartier</option>
                  {availableQuartiers.map((quartier) => (
                    <option key={quartier} value={quartier}>{quartier}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indications supplémentaires
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.address_details}
                    onChange={(e) => setFormData({ ...formData, address_details: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Près de la mosquée, en face de la pharmacie..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Zones de livraison */}
          {store && (
            <DeliveryZonesManager
              storeId={store.id}
              initialZones={deliveryZones}
              onZonesChange={(zones) => setDeliveryZones(zones)}
            />
          )}

          {/* Social Links */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={20} className="text-emerald-600" />
              Réseaux sociaux
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="https://www.maboutique.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <div className="relative">
                  <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="facebook.com/maboutique"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="@maboutique"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter / X
                </label>
                <div className="relative">
                  <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="@maboutique"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                {store ? 'Enregistrer les modifications' : 'Créer ma boutique'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StorePage
