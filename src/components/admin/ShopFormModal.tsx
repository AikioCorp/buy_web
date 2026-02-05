import React, { useState, useEffect } from 'react'
import { X, Save, Upload, Store, MapPin, Phone, Mail, Truck } from 'lucide-react'
import { locationsService, Commune, Quartier } from '../../lib/api/locationsService'

export interface ShopFormData {
  name: string
  slug: string
  description: string
  logo_url: string
  banner_url: string
  address_commune: string
  address_quartier: string
  address_details: string
  city: string
  phone: string
  whatsapp: string
  email: string
  delivery_base_fee: number
  delivery_available: boolean
  is_active: boolean
}

interface ShopFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ShopFormData, logoFile?: File, bannerFile?: File) => Promise<void>
  initialData?: Partial<ShopFormData>
  isLoading?: boolean
  title?: string
}

const ShopFormModal: React.FC<ShopFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
  title = 'Nouvelle Boutique'
}) => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    banner_url: '',
    address_commune: '',
    address_quartier: '',
    address_details: '',
    city: 'Bamako',
    phone: '',
    whatsapp: '',
    email: '',
    delivery_base_fee: 1000,
    delivery_available: true,
    is_active: true
  })

  const [communes, setCommunes] = useState<Commune[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [whatsappDifferent, setWhatsappDifferent] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      loadCommunes()
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          slug: initialData.slug || '',
          description: initialData.description || '',
          logo_url: initialData.logo_url || '',
          banner_url: initialData.banner_url || '',
          address_commune: initialData.address_commune || '',
          address_quartier: initialData.address_quartier || '',
          address_details: initialData.address_details || '',
          city: initialData.city || 'Bamako',
          phone: initialData.phone || '',
          whatsapp: initialData.whatsapp || '',
          email: initialData.email || '',
          delivery_base_fee: initialData.delivery_base_fee || 1000,
          delivery_available: initialData.delivery_available ?? true,
          is_active: initialData.is_active ?? true
        })
        setLogoPreview(initialData.logo_url || '')
        setBannerPreview(initialData.banner_url || '')
        setWhatsappDifferent(initialData.whatsapp !== initialData.phone && !!initialData.whatsapp)
        
        if (initialData.address_commune) {
          loadQuartiers(initialData.address_commune)
        }
      } else {
        // Reset form for new shop
        setFormData({
          name: '',
          slug: '',
          description: '',
          logo_url: '',
          banner_url: '',
          address_commune: '',
          address_quartier: '',
          address_details: '',
          city: 'Bamako',
          phone: '',
          whatsapp: '',
          email: '',
          delivery_base_fee: 1000,
          delivery_available: true,
          is_active: true
        })
        setLogoPreview('')
        setBannerPreview('')
        setLogoFile(null)
        setBannerFile(null)
        setWhatsappDifferent(false)
      }
    }
  }, [isOpen, initialData])

  useEffect(() => {
    if (formData.address_commune) {
      loadQuartiers(formData.address_commune)
    }
  }, [formData.address_commune])

  const loadCommunes = async () => {
    try {
      const data = await locationsService.getCommunes()
      setCommunes(data)
    } catch (err) {
      console.error('Error loading communes:', err)
    }
  }

  const loadQuartiers = async (communeName: string) => {
    try {
      const data = await locationsService.getQuartiersByCommuneName(communeName)
      setQuartiers(data)
    } catch (err) {
      console.error('Error loading quartiers:', err)
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
    setFormData({ ...formData, name, slug: generateSlug(name) })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    
    if (type === 'logo') {
      setLogoFile(file)
      setLogoPreview(previewUrl)
    } else {
      setBannerFile(file)
      setBannerPreview(previewUrl)
    }
  }

  const handleSubmit = async () => {
    await onSave(formData, logoFile || undefined, bannerFile || undefined)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Store size={24} />
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Store size={16} className="text-emerald-600" />
              Informations de base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Ma Boutique"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="ma-boutique"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Description de la boutique..."
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo de la boutique</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Choisir un fichier</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>
                {logoPreview && (
                  <img src={logoPreview} alt="Logo preview" className="mt-2 h-16 w-16 object-cover rounded-xl border-2 border-gray-200" />
                )}
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bannière de la boutique</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Choisir un fichier</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'banner')}
                      className="hidden"
                    />
                  </label>
                </div>
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner preview" className="mt-2 h-20 w-full object-cover rounded-xl border-2 border-gray-200" />
                )}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              Adresse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                <select
                  value={formData.address_commune}
                  onChange={(e) => setFormData({ ...formData, address_commune: e.target.value, address_quartier: '' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">Sélectionner une commune</option>
                  {communes.map((commune) => (
                    <option key={commune.id} value={commune.name}>{commune.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                <select
                  value={formData.address_quartier}
                  onChange={(e) => setFormData({ ...formData, address_quartier: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  disabled={!formData.address_commune}
                >
                  <option value="">Sélectionner un quartier</option>
                  {quartiers.map((quartier) => (
                    <option key={quartier.id} value={quartier.name}>{quartier.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Détails de l'adresse</label>
                <input
                  type="text"
                  value={formData.address_details}
                  onChange={(e) => setFormData({ ...formData, address_details: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Rue, numéro, repère..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Phone size={16} className="text-emerald-600" />
              Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const phone = e.target.value
                    setFormData({ 
                      ...formData, 
                      phone,
                      whatsapp: whatsappDifferent ? formData.whatsapp : phone
                    })
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="+223 XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="contact@boutique.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappDifferent}
                    onChange={(e) => {
                      setWhatsappDifferent(e.target.checked)
                      if (!e.target.checked) {
                        setFormData({ ...formData, whatsapp: formData.phone })
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Numéro WhatsApp différent du téléphone</span>
                </label>
              </div>

              {whatsappDifferent && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="+223 XX XX XX XX"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Livraison */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Truck size={16} className="text-emerald-600" />
              Livraison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de livraison de base (FCFA)</label>
                <input
                  type="number"
                  value={formData.delivery_base_fee}
                  onChange={(e) => setFormData({ ...formData, delivery_base_fee: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.delivery_available}
                    onChange={(e) => setFormData({ ...formData, delivery_available: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Livraison disponible</span>
                </label>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-gray-700">Boutique active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.slug}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
      </div>
    </div>
  )
}

export default ShopFormModal
