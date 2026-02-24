import React, { useState, useEffect } from 'react'
import { 
  X, Upload, Plus, Trash2, Image as ImageIcon, Loader2,
  AlertCircle, CheckCircle, DollarSign, Package, Tag, Info, Layers, Box, Save,
  Truck, Shield, RefreshCw, Check, Settings, Search
} from 'lucide-react'
import { productsService, Product, CreateProductData, Category } from '../../lib/api/productsService'
import { categoriesService } from '../../lib/api/categoriesService'

interface ProductVariant {
  id?: number
  name: string
  value: string
  price_modifier: number
  stock: number
  image_url?: string
  imageFile?: File
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: Product | null
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ 
  isOpen, onClose, onSuccess, product 
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'variants' | 'images' | 'seo'>('general')
  const [categorySearch, setCategorySearch] = useState('')
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [isInStock, setIsInStock] = useState(true)
  const [showStockInput, setShowStockInput] = useState(false)
  const [seoData, setSeoData] = useState({ meta_title: '', meta_description: '', tags: [] as string[] })

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    base_price: '',
    promo_price: '',
    stock: '',
    low_stock_threshold: '10',
    category: '',
    is_active: true,
  })

  const [features, setFeatures] = useState({
    delivery_time: '24-48h',
    warranty_duration: '12 mois',
    return_policy: '7 jours',
    is_authentic: true,
  })

  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      setActiveTab('general')
      setError(null)
      setSuccess(null)
      
      if (product) {
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          sku: '',
          description: product.description || '',
          base_price: product.base_price || '',
          promo_price: (product as any).promo_price || '',
          stock: product.stock?.toString() || '0',
          low_stock_threshold: product.low_stock_threshold?.toString() || '10',
          category: product.category?.id?.toString() || '',
          is_active: product.is_active !== false,
        })
        // Backend returns 'images' but interface uses 'media'
        setExistingImages((product as any).images || product.media || [])
        setImagesToDelete([])
        setVariants([])
        // Catégories multiples
        const productCatIds = (product as any).category_ids || (product.category?.id ? [product.category.id] : [])
        setCategoryIds(productCatIds)
        // Stock
        setIsInStock((product.stock || 0) > 0)
        setShowStockInput(product.track_inventory === true)
        // SEO
        setSeoData({
          meta_title: (product as any).meta_title || '',
          meta_description: (product as any).meta_description || '',
          tags: (product as any).tags || []
        })
        setFeatures({
          delivery_time: (product as any).delivery_time || '24-48h',
          warranty_duration: (product as any).warranty_duration || '12 mois',
          return_policy: (product as any).return_policy || '7 jours',
          is_authentic: (product as any).is_authentic !== false,
        })
      } else {
        setFormData({
          name: '',
          slug: '',
          sku: '',
          description: '',
          base_price: '',
          promo_price: '',
          stock: '',
          low_stock_threshold: '10',
          category: '',
          is_active: true,
        })
        setImages([])
        setImagePreviewUrls([])
        setExistingImages([])
        setImagesToDelete([])
        setVariants([])
        setFeatures({
          delivery_time: '24-48h',
          warranty_duration: '12 mois',
          return_policy: '7 jours',
          is_authentic: true,
        })
        setCategoryIds([])
        setCategorySearch('')
        setIsInStock(true)
        setShowStockInput(false)
        setSeoData({ meta_title: '', meta_description: '', tags: [] })
      }
    }
  }, [isOpen, product])

  // Cleanup pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      // Réinitialiser les previews d'images pour libérer la mémoire
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories()
      if (response.data) {
        const flattenCategories = (cats: Category[], prefix = ''): Category[] => {
          let result: Category[] = []
          cats.forEach(cat => {
            result.push({ ...cat, name: prefix + cat.name })
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenCategories(cat.children, prefix + '— '))
            }
          })
          return result
        }
        setCategories(flattenCategories(response.data))
      }
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
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
      slug: product ? formData.slug : generateSlug(name)
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages(prev => [...prev, ...newFiles])
      // Generate preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviewUrls(prev => [...prev, ...newUrls])
    }
  }

  const handleRemoveImage = (index: number) => {
    // Libérer la mémoire de l'URL de preview
    if (imagePreviewUrls[index]) {
      URL.revokeObjectURL(imagePreviewUrls[index])
    }
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    const imageToRemove = existingImages[index]
    if (imageToRemove) {
      // Suivre l'URL de l'image pour la supprimer côté serveur
      const imageUrl = imageToRemove.file || imageToRemove.image_url
      if (imageUrl) {
        setImagesToDelete(prev => [...prev, imageUrl])
        console.log('Image marquée pour suppression:', imageUrl)
      }
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index))
    // Réinitialiser l'index de l'image principale si nécessaire
    if (index === mainImageIndex) {
      setMainImageIndex(0)
    } else if (index < mainImageIndex) {
      setMainImageIndex(prev => prev - 1)
    }
  }

  const setAsMainImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Réorganiser les images existantes
      const newExistingImages = [...existingImages]
      const [selectedImage] = newExistingImages.splice(index, 1)
      newExistingImages.unshift(selectedImage)
      setExistingImages(newExistingImages)
    } else {
      // Réorganiser les nouvelles images
      const adjustedIndex = index - existingImages.length
      const newImages = [...images]
      const newUrls = [...imagePreviewUrls]
      
      const [selectedImage] = newImages.splice(adjustedIndex, 1)
      const [selectedUrl] = newUrls.splice(adjustedIndex, 1)
      
      newImages.unshift(selectedImage)
      newUrls.unshift(selectedUrl)
      
      setImages(newImages)
      setImagePreviewUrls(newUrls)
    }
    setMainImageIndex(0)
  }

  const addVariant = () => {
    // Pre-fill price_modifier with base_price if available
    const basePrice = parseFloat(formData.base_price) || 0
    setVariants([...variants, { name: '', value: '', price_modifier: basePrice, stock: 0 }])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | File | undefined) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Le nom du produit est requis')
      return false
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      setError('Le prix doit être supérieur à 0')
      return false
    }
    if (categoryIds.length === 0 && !formData.category) {
      setError('Veuillez sélectionner au moins une catégorie')
      return false
    }
    
    // Validate variant stocks don't exceed total product stock
    if (variants.length > 0 && showStockInput) {
      const totalVariantStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      const productStock = parseInt(formData.stock) || 0
      
      if (totalVariantStock > productStock) {
        setError(`Le stock total des variantes (${totalVariantStock}) ne peut pas dépasser le stock du produit (${productStock})`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!validateForm()) return

    try {
      setLoading(true)

      // Déterminer le stock basé sur la gestion
      const stockValue = showStockInput ? (parseInt(formData.stock) || 0) : (isInStock ? 999999 : 0)
      
      const productData: CreateProductData & { stock?: number; low_stock_threshold?: number; is_active?: boolean; promo_price?: string; track_inventory?: boolean; category_ids?: number[]; meta_title?: string; meta_description?: string; tags?: string[] } = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        base_price: formData.base_price,
        promo_price: formData.promo_price || undefined,
        category: categoryIds.length > 0 ? categoryIds[0] : parseInt(formData.category),
        category_ids: categoryIds.length > 0 ? categoryIds : (formData.category ? [parseInt(formData.category)] : []),
        stock: stockValue,
        track_inventory: showStockInput,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        is_active: formData.is_active,
        // Product characteristics
        delivery_time: features.delivery_time,
        warranty_duration: features.warranty_duration,
        return_policy: features.return_policy,
        is_authentic: features.is_authentic,
        // SEO
        meta_title: seoData.meta_title || undefined,
        meta_description: seoData.meta_description || undefined,
        tags: seoData.tags.length > 0 ? seoData.tags : undefined,
      }

      let savedProduct: Product | undefined

      if (product) {
        // Inclure les images à supprimer dans la mise à jour
        const updateData = {
          ...productData,
          images_to_delete: imagesToDelete
        }
        const response = await productsService.updateProduct(product.id, updateData)
        if (response.error) {
          throw new Error(response.error)
        }
        savedProduct = response.data
        setSuccess('Produit mis à jour avec succès!')
        // Réinitialiser les images à supprimer après succès
        setImagesToDelete([])
      } else {
        const response = await productsService.createProduct(productData)
        if (response.error) {
          throw new Error(response.error)
        }
        savedProduct = response.data
        setSuccess('Produit créé avec succès!')
      }

      // Upload images - utiliser la même logique que côté admin
      if (savedProduct && images.length > 0) {
        setUploadingImages(true)
        try {
          const uploadResult = await productsService.uploadProductImages(savedProduct.id, images)
          if (uploadResult.errors && uploadResult.errors.length > 0) {
            console.error('Erreurs upload images:', uploadResult.errors)
            setError(`${uploadResult.errors.length} image(s) n'ont pas pu être uploadées. Vérifiez que votre boutique est approuvée.`)
          } else {
            console.log('✅ Images uploadées avec succès:', uploadResult.data?.length)
          }
        } catch (imgError: any) {
          console.error('Erreur upload images:', imgError)
          setError('Erreur lors de l\'upload des images. Vérifiez que votre boutique est approuvée.')
        }
        setUploadingImages(false)
      }

      // Upload variant images and save variants
      if (savedProduct && variants.length > 0) {
        try {
          // Upload variant images first
          const variantsWithUrls = await Promise.all(
            variants.map(async (variant) => {
              if (variant.imageFile) {
                try {
                  const response = await productsService.uploadProductImage(savedProduct.id, variant.imageFile)
                  return { ...variant, image_url: (response.data as any)?.image_url || (response.data as any)?.file }
                } catch (err) {
                  console.error('Erreur upload image variante:', err)
                  return variant
                }
              }
              return variant
            })
          )
          
          // Save variants with image URLs
          await productsService.saveProductVariants(savedProduct.id, variantsWithUrls)
        } catch (variantError) {
          console.error('Erreur sauvegarde variantes:', variantError)
        }
      }

      // Appeler onSuccess sans délai pour éviter les problèmes de timing
      onSuccess()
      // Le modal sera fermé par le parent via handleFormSuccess

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-green-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {product ? 'Modifier le produit' : 'Nouveau Produit'}
            </h2>
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
                  ? 'bg-white text-emerald-600 shadow-sm'
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
                  ? 'bg-white text-emerald-600 shadow-sm'
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
                  ? 'bg-white text-emerald-600 shadow-sm'
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
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <ImageIcon size={16} />
                Images
              </span>
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'seo'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Search size={16} />
                SEO
              </span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Ex: T-shirt Premium Coton"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="15000"
                    />
                  </div>
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
                      value={formData.promo_price}
                      onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${
                        formData.promo_price && formData.base_price && Number(formData.promo_price) >= Number(formData.base_price)
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="12000"
                    />
                  </div>
                  {formData.promo_price && formData.base_price && Number(formData.promo_price) >= Number(formData.base_price) ? (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> Le prix promo doit être inférieur au prix normal ({formData.base_price} FCFA)
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Laissez vide si pas de promotion</p>
                  )}
                </div>

                {/* Stock - Gestion avancée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gestion du stock
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={isInStock}
                        onChange={(e) => {
                          setIsInStock(e.target.checked)
                          if (e.target.checked) setShowStockInput(false)
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <span className={`font-medium ${isInStock ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isInStock ? '✓ En stock' : '✗ Rupture de stock'}
                        </span>
                        {isInStock && !showStockInput && (
                          <span className="text-sm text-gray-500 ml-2">(illimité)</span>
                        )}
                        {showStockInput && formData.stock && (
                          <span className="text-sm text-gray-500 ml-2">({formData.stock} unités)</span>
                        )}
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setShowStockInput(!showStockInput)
                        if (!showStockInput && !formData.stock) {
                          setFormData({ ...formData, stock: '100' })
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                        showStockInput 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <Box size={16} />
                      {showStockInput ? 'Désactiver la gestion de stock' : 'Gérer le stock (quantité limitée)'}
                    </button>

                    {showStockInput && (
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-xs text-blue-600 mb-2">Stock géré avec quantité limitée</p>
                        <div className="relative">
                          <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => {
                              const qty = e.target.value
                              setFormData({ ...formData, stock: qty })
                              setIsInStock(parseInt(qty) > 0)
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                            placeholder="Quantité en stock"
                            min="0"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button type="button" onClick={() => { setFormData({ ...formData, stock: '0' }); setIsInStock(false) }}
                            className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                            Rupture (0)
                          </button>
                          <button type="button" onClick={() => { setFormData({ ...formData, stock: '10' }); setIsInStock(true) }}
                            className="flex-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200">
                            Faible (10)
                          </button>
                          <button type="button" onClick={() => { setFormData({ ...formData, stock: '100' }); setIsInStock(true) }}
                            className="flex-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200">
                            Normal (100)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Catégories multiples avec recherche */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégories <span className="text-red-500">*</span>
                    {categoryIds.length > 0 && (
                      <span className="ml-2 text-emerald-600 font-normal">({categoryIds.length} sélectionnée{categoryIds.length > 1 ? 's' : ''})</span>
                    )}
                  </label>
                  
                  {/* Catégories sélectionnées */}
                  {categoryIds.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      {categoryIds.map(catId => {
                        const cat = categories.find(c => c.id === catId)
                        return cat ? (
                          <span key={catId} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm">
                            <Tag size={12} />
                            {cat.name.replace(/^—\s*/g, '')}
                            <button
                              type="button"
                              onClick={() => setCategoryIds(categoryIds.filter(id => id !== catId))}
                              className="ml-1 hover:bg-emerald-700 rounded p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Barre de recherche */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Rechercher une catégorie..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {categorySearch && (
                      <button type="button" onClick={() => setCategorySearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Liste des catégories */}
                  <div className="border rounded-xl bg-white max-h-48 overflow-y-auto">
                    {categories
                      .filter(cat => categorySearch === '' || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(cat => {
                        const isSelected = categoryIds.includes(cat.id)
                        const isSubCategory = cat.name.startsWith('—')
                        return (
                          <label 
                            key={cat.id} 
                            className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors ${
                              isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                            } ${isSubCategory ? 'pl-8' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCategoryIds([...categoryIds, cat.id])
                                } else {
                                  setCategoryIds(categoryIds.filter(id => id !== cat.id))
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className={`text-sm ${isSelected ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}>
                              {cat.name}
                            </span>
                            {isSelected && <Check size={16} className="ml-auto text-emerald-600" />}
                          </label>
                        )
                      })}
                  </div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
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
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800">
                  <strong>Caractéristiques :</strong> Ces informations seront affichées sur la page du produit pour rassurer les acheteurs sur la livraison, la garantie et l'authenticité.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Délai de livraison */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Livraison rapide</h4>
                      <p className="text-xs text-gray-500">Délai de livraison estimé</p>
                    </div>
                  </div>
                  <select
                    value={features.delivery_time}
                    onChange={(e) => setFeatures({ ...features, delivery_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  >
                    <option value="Immédiat">Immédiat</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
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
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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

              {/* Stock Summary */}
              {variants.length > 0 && (
                <div className={`p-4 rounded-xl border-2 ${
                  variants.reduce((sum, v) => sum + (v.stock || 0), 0) > parseInt(formData.stock || '0')
                    ? 'bg-red-50 border-red-300'
                    : 'bg-green-50 border-green-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Stock des variantes</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {variants.reduce((sum, v) => sum + (v.stock || 0), 0)} / {formData.stock || 0} unités utilisées
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      variants.reduce((sum, v) => sum + (v.stock || 0), 0) > parseInt(formData.stock || '0')
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {parseInt(formData.stock || '0') - variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                    </div>
                  </div>
                  {variants.reduce((sum, v) => sum + (v.stock || 0), 0) > parseInt(formData.stock || '0') && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Le stock total des variantes dépasse le stock du produit !
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {variants.map((variant, index) => (
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                          <select
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ex: XL, 500g"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Modif. Prix (FCFA)
                            {formData.base_price && (
                              <span className="ml-2 text-xs text-gray-500">
                                Prix de base: {parseFloat(formData.base_price).toLocaleString()} FCFA
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={variant.price_modifier}
                            onChange={(e) => updateVariant(index, 'price_modifier', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="+500 ou -200"
                          />
                          {formData.base_price && variant.price_modifier !== 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Prix final: {(parseFloat(formData.base_price) + (variant.price_modifier || 0)).toLocaleString()} FCFA
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                          <input
                            type="number"
                            value={variant.stock === 0 ? '' : variant.stock}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                              updateVariant(index, 'stock', isNaN(value) ? 0 : value)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="50"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      {/* Variant Image Upload */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Image de la variante (optionnel)</label>
                        <div className="flex items-center gap-3">
                          {(variant.image_url || variant.imageFile) && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img 
                                src={variant.imageFile ? URL.createObjectURL(variant.imageFile) : variant.image_url} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2">
                              <Upload size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {variant.imageFile || variant.image_url ? 'Changer l\'image' : 'Ajouter une image'}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  updateVariant(index, 'imageFile', file)
                                }
                              }}
                            />
                          </label>
                          {(variant.image_url || variant.imageFile) && (
                            <button
                              onClick={() => {
                                updateVariant(index, 'imageFile', undefined)
                                updateVariant(index, 'image_url', undefined)
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer l'image"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addVariant}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
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
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
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
              {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Existing images */}
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={img.file || img.image_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {index !== 0 && (
                          <button
                            onClick={() => setAsMainImage(index, true)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                          >
                            <Check size={14} />
                            Principale
                          </button>
                        )}
                        <button
                          onClick={() => removeExistingImage(index)}
                          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                          ⭐ Principale
                        </div>
                      )}
                    </div>
                  ))}

                  {/* New images preview */}
                  {imagePreviewUrls.map((url, index) => {
                    const totalIndex = existingImages.length + index
                    const isMain = existingImages.length === 0 && index === 0
                    return (
                      <div key={`new-${index}`} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          {!isMain && (
                            <button
                              onClick={() => setAsMainImage(totalIndex, false)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                            >
                              <Check size={14} />
                              Principale
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {isMain && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                            ⭐ Principale
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Nouveau
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start justify-between gap-4">
                <p className="text-sm text-purple-800">
                  <strong>SEO :</strong> Optimisez votre produit pour les moteurs de recherche. 
                  Ces informations aident votre produit à apparaître dans les résultats de recherche.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const generatedTitle = formData.name ? `${formData.name} - Achat en ligne au Mali` : ''
                    let generatedDesc = ''
                    if (formData.description) {
                      generatedDesc = formData.description.slice(0, 140) + (formData.description.length > 140 ? '...' : '')
                    } else if (formData.name) {
                      generatedDesc = `Achetez ${formData.name} au meilleur prix sur BuyMore Mali. Livraison rapide et paiement sécurisé.`
                    }
                    const generatedTags: string[] = []
                    if (formData.name) {
                      const words = formData.name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
                      generatedTags.push(...words.slice(0, 5))
                    }
                    generatedTags.push('achat', 'mali', 'buymore')
                    
                    setSeoData({
                      meta_title: generatedTitle.slice(0, 60),
                      meta_description: generatedDesc.slice(0, 160),
                      tags: [...new Set(generatedTags)]
                    })
                  }}
                  className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Générer auto
                </button>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre SEO (Meta Title)
                </label>
                <input
                  type="text"
                  value={seoData.meta_title}
                  onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                  placeholder={formData.name || 'Titre optimisé pour Google'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  maxLength={60}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Laissez vide pour utiliser le nom du produit</p>
                  <p className={`text-xs ${seoData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                    {seoData.meta_title.length}/60
                  </p>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description SEO (Meta Description)
                </label>
                <textarea
                  value={seoData.meta_description}
                  onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                  placeholder="Description courte et attrayante pour les résultats Google (160 caractères max)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={160}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Apparaît sous le titre dans les résultats Google</p>
                  <p className={`text-xs ${seoData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                    {seoData.meta_description.length}/160
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags / Mots-clés
                </label>
                <input
                  type="text"
                  value={seoData.tags.join(', ')}
                  onChange={(e) => {
                    const tagsArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    setSeoData({ ...seoData, tags: tagsArray })
                  }}
                  placeholder="smartphone, téléphone, mobile, samsung (séparés par des virgules)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Séparez les mots-clés par des virgules</p>
                {seoData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {seoData.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setSeoData({ ...seoData, tags: seoData.tags.filter((_, i) => i !== idx) })}
                          className="hover:text-purple-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Preview */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3 font-medium">Aperçu Google</p>
                <div className="space-y-1">
                  <p className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                    {seoData.meta_title || formData.name || 'Titre du produit'} | BuyMore
                  </p>
                  <p className="text-green-700 text-sm">
                    buymore.ml › produits › {formData.slug || 'nom-du-produit'}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {seoData.meta_description || formData.description?.slice(0, 160) || 'Description du produit qui apparaîtra dans les résultats de recherche Google...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {activeTab === 'general' && 'Étape 1/5 - Informations générales'}
            {activeTab === 'features' && 'Étape 2/5 - Caractéristiques'}
            {activeTab === 'variants' && 'Étape 3/5 - Variantes et stock'}
            {activeTab === 'images' && 'Étape 4/5 - Images du produit'}
            {activeTab === 'seo' && 'Étape 5/5 - Référencement SEO'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImages}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading || uploadingImages ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploadingImages ? 'Upload images...' : 'Enregistrement...'}
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
