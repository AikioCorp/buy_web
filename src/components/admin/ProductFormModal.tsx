import React, { useState, useEffect } from 'react'
import { 
  X, Save, Plus, Trash2, Upload, Image as ImageIcon, 
  Package, Tag, DollarSign, Layers, Box, Info, Truck, Shield, RefreshCw, Check, Settings
} from 'lucide-react'
import { Category } from '../../lib/api/categoriesService'
import { Shop } from '../../lib/api/shopsService'

export interface ProductVariant {
  id?: number
  name: string
  value: string
  price_modifier: number
  stock: number
}

export interface ProductFeatures {
  delivery_time: string
  warranty_duration: string
  return_policy: string
  is_authentic: boolean
}

export interface ProductFormData {
  name: string
  slug: string
  description: string
  base_price: string
  promo_price?: string
  category_id: number | null
  store_id: number | null
  stock_quantity: number
  sku: string
  is_active: boolean
  variants: ProductVariant[]
  images: File[]
  existing_images?: string[]
  features?: ProductFeatures
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<void>
  initialData?: Partial<ProductFormData>
  categories: Category[]
  shops: Shop[]
  isLoading?: boolean
  title?: string
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  shops,
  isLoading = false,
  title = 'Nouveau Produit'
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    base_price: '',
    promo_price: '',
    category_id: null,
    store_id: null,
    stock_quantity: 0,
    sku: '',
    is_active: true,
    variants: [],
    images: [],
    existing_images: []
  })

  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'variants' | 'images'>('general')
  const [features, setFeatures] = useState<ProductFeatures>({
    delivery_time: '24-48h',
    warranty_duration: '12 mois',
    return_policy: '7 jours',
    is_authentic: true,
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        base_price: initialData.base_price || '',
        promo_price: initialData.promo_price || '',
        category_id: initialData.category_id || null,
        store_id: initialData.store_id || null,
        stock_quantity: initialData.stock_quantity || 0,
        sku: initialData.sku || '',
        is_active: initialData.is_active ?? true,
        variants: initialData.variants || [],
        images: [],
        existing_images: initialData.existing_images || []
      })
      setImagePreview(initialData.existing_images || [])
    }
  }, [initialData])

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData({ ...formData, images: [...formData.images, ...files] })
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    const existingCount = formData.existing_images?.length || 0
    
    if (index < existingCount) {
      const newExisting = [...(formData.existing_images || [])]
      newExisting.splice(index, 1)
      setFormData({ ...formData, existing_images: newExisting })
    } else {
      const newImages = [...formData.images]
      newImages.splice(index - existingCount, 1)
      setFormData({ ...formData, images: newImages })
    }
    
    const newPreviews = [...imagePreview]
    newPreviews.splice(index, 1)
    setImagePreview(newPreviews)
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: '', value: '', price_modifier: 0, stock: 0 }
      ]
    })
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData({ ...formData, variants: newVariants })
  }

  const removeVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: newVariants })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Le prix doit être supérieur à 0'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'La catégorie est requise'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const flattenCategories = (cats: Category[], prefix: string = ''): Array<{ id: number; name: string }> => {
    let result: Array<{ id: number; name: string }> = []
    for (const cat of cats) {
      result.push({ id: cat.id, name: prefix + cat.name })
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, prefix + '— '))
      }
    }
    return result
  }

  const flatCategories = flattenCategories(categories || [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Info size={16} />
                Informations
              </span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'features'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings size={16} />
                Caractéristiques
              </span>
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'variants'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers size={16} />
                Variantes
              </span>
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'images'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <ImageIcon size={16} />
                Images
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: T-shirt Premium Coton"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="t-shirt-premium-coton"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Référence)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="PROD-001"
                  />
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix de base (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.base_price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="15000"
                    />
                  </div>
                  {errors.base_price && <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>}
                </div>

                {/* Prix Promo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix promo (FCFA)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                    <input
                      type="number"
                      value={formData.promo_price || ''}
                      onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="12000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Laissez vide si pas de promotion</p>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité en stock
                  </label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="100"
                      min="0"
                    />
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white ${
                        errors.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {flatCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                </div>

                {/* Boutique */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boutique
                  </label>
                  <select
                    value={formData.store_id || ''}
                    onChange={(e) => setFormData({ ...formData, store_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Sélectionner une boutique</option>
                    {(shops || []).map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Décrivez votre produit en détail..."
                  />
                </div>

                {/* Actif */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Produit actif et visible</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  <strong>Caractéristiques :</strong> Ces informations seront affichées sur la page du produit pour rassurer les acheteurs sur la livraison, la garantie et l'authenticité.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Délai de livraison */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Livraison rapide</h4>
                      <p className="text-xs text-gray-500">Délai de livraison estimé</p>
                    </div>
                  </div>
                  <select
                    value={features.delivery_time}
                    onChange={(e) => setFeatures({ ...features, delivery_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="24h">Sous 24h</option>
                    <option value="24-48h">Sous 24-48h</option>
                    <option value="48-72h">Sous 48-72h</option>
                    <option value="3-5 jours">3-5 jours</option>
                    <option value="5-7 jours">5-7 jours</option>
                    <option value="1-2 semaines">1-2 semaines</option>
                  </select>
                </div>

                {/* Garantie */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Garantie</h4>
                      <p className="text-xs text-gray-500">Durée de la garantie</p>
                    </div>
                  </div>
                  <select
                    value={features.warranty_duration}
                    onChange={(e) => setFeatures({ ...features, warranty_duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="Sans garantie">Sans garantie</option>
                    <option value="7 jours">7 jours</option>
                    <option value="15 jours">15 jours</option>
                    <option value="1 mois">1 mois</option>
                    <option value="3 mois">3 mois</option>
                    <option value="6 mois">6 mois</option>
                    <option value="12 mois">12 mois</option>
                    <option value="24 mois">24 mois</option>
                  </select>
                </div>

                {/* Politique de retour */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Retour facile</h4>
                      <p className="text-xs text-gray-500">Délai pour retourner le produit</p>
                    </div>
                  </div>
                  <select
                    value={features.return_policy}
                    onChange={(e) => setFeatures({ ...features, return_policy: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="Non retournable">Non retournable</option>
                    <option value="3 jours">Sous 3 jours</option>
                    <option value="7 jours">Sous 7 jours</option>
                    <option value="14 jours">Sous 14 jours</option>
                    <option value="30 jours">Sous 30 jours</option>
                  </select>
                </div>

                {/* Authenticité */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Authentique</h4>
                      <p className="text-xs text-gray-500">Produit 100% original</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={features.is_authentic}
                      onChange={(e) => setFeatures({ ...features, is_authentic: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ce produit est 100% authentique et original</span>
                  </label>
                </div>
              </div>

              {/* Aperçu */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Aperçu sur la page produit</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Livraison rapide</p>
                      <p className="text-xs text-gray-500">Sous {features.delivery_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Garantie</p>
                      <p className="text-xs text-gray-500">{features.warranty_duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Retour facile</p>
                      <p className="text-xs text-gray-500">{features.return_policy}</p>
                    </div>
                  </div>
                  {features.is_authentic && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Authentique</p>
                        <p className="text-xs text-gray-500">100% original</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Variantes :</strong> Ajoutez des options comme les tailles (XS, S, M, L, XL), 
                  les quantités (100g, 500g, 1kg), ou les dimensions. Chaque variante peut avoir son propre stock et modificateur de prix.
                </p>
              </div>

              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-700">Variante {index + 1}</span>
                      <button
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Taille">Taille</option>
                          <option value="Quantité">Quantité</option>
                          <option value="Couleur">Couleur</option>
                          <option value="Dimension">Dimension</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Valeur</label>
                        <input
                          type="text"
                          value={variant.value}
                          onChange={(e) => updateVariant(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: XL, 500g"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Modif. Prix (FCFA)</label>
                        <input
                          type="number"
                          value={variant.price_modifier}
                          onChange={(e) => updateVariant(index, 'price_modifier', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="+500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="50"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addVariant}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Ajouter une variante
                </button>
              </div>

              {/* Exemples de variantes */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Exemples de variantes :</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium text-gray-800">Vêtements</p>
                    <p className="text-gray-500">Taille: XS, S, M, L, XL</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium text-gray-800">Alimentaire</p>
                    <p className="text-gray-500">Quantité: 100g, 500g, 1kg</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium text-gray-800">Meubles</p>
                    <p className="text-gray-500">Dimension: Petit, Moyen, Grand</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Conseil :</strong> Ajoutez au minimum 5 images de qualité pour valoriser votre produit. 
                  Les images doivent être claires et montrer le produit sous différents angles.
                </p>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">Cliquez pour ajouter des images</p>
                  <p className="text-gray-500 text-sm mt-1">ou glissez-déposez vos fichiers ici</p>
                  <p className="text-gray-400 text-xs mt-2">PNG, JPG, GIF jusqu'à 10MB</p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removeImage(index)}
                          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Principale
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {activeTab === 'general' && 'Étape 1/4 - Informations générales'}
            {activeTab === 'features' && 'Étape 2/4 - Caractéristiques'}
            {activeTab === 'variants' && 'Étape 3/4 - Variantes et stock'}
            {activeTab === 'images' && 'Étape 4/4 - Images du produit'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
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
    </div>
  )
}

export default ProductFormModal
