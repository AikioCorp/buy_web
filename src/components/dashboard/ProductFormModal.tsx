import React, { useState, useEffect, useRef } from 'react'
import { 
  X, Upload, Plus, Trash2, Image as ImageIcon, Loader2,
  AlertCircle, CheckCircle, DollarSign, Package, Tag, FileText
} from 'lucide-react'
import { productsService, Product, CreateProductData, Category } from '../../lib/api/productsService'
import { categoriesService } from '../../lib/api/categoriesService'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    base_price: '',
    stock: '',
    low_stock_threshold: '10',
    category: '',
    is_active: true,
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (product) {
        // Mode édition
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          base_price: product.base_price || '',
          stock: product.stock?.toString() || '0',
          low_stock_threshold: product.low_stock_threshold?.toString() || '10',
          category: product.category?.id?.toString() || '',
          is_active: product.is_active !== false,
        })
        setExistingImages(product.media || [])
      } else {
        // Mode création - reset
        setFormData({
          name: '',
          slug: '',
          description: '',
          base_price: '',
          stock: '',
          low_stock_threshold: '10',
          category: '',
          is_active: true,
        })
        setImages([])
        setImagePreviewUrls([])
        setExistingImages([])
      }
      setError(null)
      setSuccess(null)
    }
  }, [isOpen, product])

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories()
      if (response.data) {
        // Flatten categories for select
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
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))

    setImages(prev => [...prev, ...newFiles])
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
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
    if (!formData.category) {
      setError('Veuillez sélectionner une catégorie')
      return false
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Le stock doit être un nombre positif')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) return

    try {
      setLoading(true)

      const productData: CreateProductData & { stock?: number; low_stock_threshold?: number; is_active?: boolean } = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        base_price: formData.base_price,
        category: parseInt(formData.category),
        stock: parseInt(formData.stock) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        is_active: formData.is_active,
      }

      let savedProduct: Product | undefined

      if (product) {
        // Mode édition
        const response = await productsService.updateProduct(product.id, productData)
        if (response.error) {
          throw new Error(response.error)
        }
        savedProduct = response.data
        setSuccess('Produit mis à jour avec succès!')
      } else {
        // Mode création
        const response = await productsService.createProduct(productData)
        if (response.error) {
          throw new Error(response.error)
        }
        savedProduct = response.data
        setSuccess('Produit créé avec succès!')
      }

      // Upload des nouvelles images si présentes
      if (savedProduct && images.length > 0) {
        setUploadingImages(true)
        for (const image of images) {
          try {
            await productsService.uploadProductImage(savedProduct.id, image)
          } catch (imgError) {
            console.error('Erreur upload image:', imgError)
          }
        }
        setUploadingImages(false)
      }

      // Attendre un peu puis fermer
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {product ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre boutique'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon size={16} className="inline mr-2" />
              Images du produit
            </label>
            <div className="flex flex-wrap gap-3">
              {/* Existing images */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img 
                    src={img.file || img.image_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* New images preview */}
              {imagePreviewUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-300">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded">
                    Nouveau
                  </div>
                </div>
              ))}

              {/* Add button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs mt-1">Ajouter</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package size={16} className="inline mr-2" />
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Ex: iPhone 15 Pro Max"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du produit
            </label>
            <div className="flex items-center">
              <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                /produit/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="iphone-15-pro-max"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-2" />
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Prix (XOF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock disponible <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Décrivez votre produit en détail..."
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Produit actif</p>
              <p className="text-sm text-gray-500">Le produit sera visible sur la boutique</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                formData.is_active ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading || uploadingImages ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploadingImages ? 'Upload images...' : 'Enregistrement...'}
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  {product ? 'Mettre à jour' : 'Créer le produit'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal
