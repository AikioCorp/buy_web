import React, { useState, useEffect } from 'react'
import { 
  Store, Save, MapPin, Mail, Phone, 
  Camera, CheckCircle, AlertCircle, Loader2, Eye,
  Upload, X, Image as ImageIcon
} from 'lucide-react'
import { shopsService, Shop, CreateShopData } from '../../lib/api/shopsService'
import { apiClient } from '../../lib/api/apiClient'
import { BAMAKO_COMMUNES } from '../../lib/api/deliveryService'
import { DeliveryZonesManager } from '../../components/dashboard/DeliveryZonesManager'
import { useAuthStore } from '../../store/authStore'
import VendorPendingApprovalPage from './VendorPendingApprovalPage'

const StorePage: React.FC = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<Shop | null>(null)
  const [pendingApproval, setPendingApproval] = useState(false)
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
    city: 'Bamako',
  })
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  
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
      console.log('🔄 Loading store...')
      const response = await shopsService.getMyShop()
      console.log('📦 Store response:', response)
      
      if (response.data) {
        // IMPORTANT: Verify this shop belongs to the current user
        const currentUserId = user?.id
        const shopOwnerId = response.data.owner_id
        
        console.log('🔍 Checking ownership:', { currentUserId, shopOwnerId })
        
        if (currentUserId && shopOwnerId && String(currentUserId) !== String(shopOwnerId)) {
          // Shop doesn't belong to this user - they need to create their own
          console.log('⚠️ Shop belongs to different user, showing create form')
          setStore(null)
          return
        }
        
        console.log('✅ Store data received:', response.data)
        setStore(response.data)
        
        // Check if shop is pending approval (is_active = false)
        if (!response.data.is_active) {
          console.log('⏳ Shop is pending approval')
          setPendingApproval(true)
        }
        
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
          city: response.data.city || 'Bamako',
        })
        // Set image previews
        if (response.data.logo_url) setLogoPreview(response.data.logo_url)
        if (response.data.banner_url) setBannerPreview(response.data.banner_url)
        // Charger les zones de livraison si disponibles
        if (response.data.delivery_zones) {
          setDeliveryZones(response.data.delivery_zones)
        }
      } else if (response.error) {
        console.log('ℹ️ No store found, user can create one')
      }
    } catch (error) {
      console.error('❌ Erreur chargement boutique:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    // Add unique suffix to avoid duplicate slug errors
    const uniqueSuffix = Date.now().toString(36).slice(-4)
    return `${baseSlug}-${uniqueSuffix}`
  }

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name, 
      slug: store ? formData.slug : generateSlug(name) 
    })
  }

  const uploadStoreImage = async (storeId: number, file: File, type: 'logo' | 'banner') => {
    console.log(`📤 Uploading ${type} for store ${storeId}...`)
    const response = await apiClient.upload<{ success: boolean; data: { publicUrl: string } }>(
      `/api/upload/stores/${storeId}?type=${type}`,
      file,
      'image'
    )
    console.log(`📦 Upload response for ${type}:`, response)
    if (response.error) {
      console.error(`❌ Upload error for ${type}:`, response.error)
      return ''
    }
    const url = response.data?.data?.publicUrl || ''
    console.log(`✅ ${type} uploaded successfully:`, url)
    return url
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
        city: formData.city,
      }

      if (store) {
        // Mise à jour
        let updateData: any = { ...data }
        
        // Upload images if provided
        if (logoFile) {
          setUploadingLogo(true)
          const logoUrl = await uploadStoreImage(store.id, logoFile, 'logo')
          if (logoUrl) {
            updateData.logo_url = logoUrl
            console.log('✅ Logo URL added to update data:', logoUrl)
          }
          setUploadingLogo(false)
        }
        if (bannerFile) {
          setUploadingBanner(true)
          const bannerUrl = await uploadStoreImage(store.id, bannerFile, 'banner')
          if (bannerUrl) {
            updateData.banner_url = bannerUrl
            console.log('✅ Banner URL added to update data:', bannerUrl)
          }
          setUploadingBanner(false)
        }
        
        console.log('📝 Updating shop with data:', updateData)
        const response = await shopsService.updateShop(store.id, updateData)
        console.log('📦 Update shop response:', response)
        
        if (response.data) {
          setStore(response.data)
          setLogoFile(null)
          setBannerFile(null)
          setMessage({ type: 'success', text: 'Boutique mise à jour avec succès!' })
          // Reload to get fresh data
          await loadStore()
        } else if (response.error) {
          setMessage({ type: 'error', text: response.error })
        }
      } else {
        // Création
        const response = await shopsService.createShop(data)
        if (response.data) {
          const newShop = response.data
          setStore(newShop)
          
          // Upload images after creation
          if (logoFile || bannerFile) {
            if (logoFile) {
              setUploadingLogo(true)
              const logoUrl = await uploadStoreImage(newShop.id, logoFile, 'logo')
              if (logoUrl) await shopsService.updateShop(newShop.id, { logo_url: logoUrl })
              setUploadingLogo(false)
            }
            if (bannerFile) {
              setUploadingBanner(true)
              const bannerUrl = await uploadStoreImage(newShop.id, bannerFile, 'banner')
              if (bannerUrl) await shopsService.updateShop(newShop.id, { banner_url: bannerUrl })
              setUploadingBanner(false)
            }
          }
          
          setLogoFile(null)
          setBannerFile(null)
          setMessage({ type: 'success', text: 'Boutique créée avec succès!' })
          await loadStore()
        } else if (response.error) {
          // Handle error object or string
          const errorText = typeof response.error === 'object' 
            ? ((response.error as any).message || JSON.stringify(response.error))
            : response.error
          setMessage({ type: 'error', text: errorText })
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Une erreur est survenue' })
    } finally {
      setSaving(false)
      setUploadingLogo(false)
      setUploadingBanner(false)
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

  // Show pending approval page if shop exists but is not active
  if (store && pendingApproval) {
    return <VendorPendingApprovalPage shopName={store.name} shopEmail={store.email} />
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

      {/* Shop Approval Warning */}
      {store && !store.is_active && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-yellow-50 text-yellow-800 border border-yellow-200">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Boutique en attente d'approbation</p>
            <p className="text-sm mt-1">
              Votre boutique est en cours de vérification par notre équipe. Vous ne pourrez pas ajouter de produits tant qu'elle n'est pas approuvée.
            </p>
          </div>
        </div>
      )}

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
        {/* Store Preview Card with Banner */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-6">
          {/* Banner */}
          <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-green-600">
            {bannerPreview && (
              <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
            )}
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
            <label
              htmlFor="banner-upload"
              className="absolute top-2 right-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white cursor-pointer transition-colors"
            >
              {uploadingBanner ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              Bannière
            </label>
            {bannerFile && (
              <button
                type="button"
                onClick={() => {
                  setBannerFile(null)
                  setBannerPreview(store?.banner_url || null)
                }}
                className="absolute top-2 right-32 p-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Logo and Info */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-6 -mt-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-lg border-2 border-white flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={40} className="text-emerald-600" />
                  )}
                </div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 cursor-pointer transition-colors"
                >
                  {uploadingLogo ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </label>
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(store?.logo_url || null)
                    }}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="flex-1 mt-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.name || 'Nom de votre boutique'}
                </h2>
                <p className="text-gray-500 mt-1">
                  buymore.ml/shop/{formData.slug || 'votre-boutique'}
                </p>
                {store && (
                  <div className="flex items-center gap-4 mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      store.is_active 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {store.is_active ? '● En ligne' : '○ En attente de validation'}
                    </span>
                    {store.products_count !== undefined && (
                      <span className="text-sm text-gray-500">
                        {store.products_count} produit{store.products_count > 1 ? 's' : ''}
                      </span>
                    )}
                    <a 
                      href={`/shops/${store.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <Eye size={16} />
                      Voir ma boutique
                    </a>
                  </div>
                )}
              </div>
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
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Bamako"
                />
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
