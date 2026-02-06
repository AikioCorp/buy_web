import React from 'react'
import { X, Edit, Package, Tag, TrendingUp, Clock, Shield, RotateCcw, CheckCircle } from 'lucide-react'
import { Product } from '../../lib/api/productsService'

interface ProductPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onEdit: () => void
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit
}) => {
  if (!isOpen || !product) return null

  // Get images
  const mediaArray = (product as any).images || product.media || []
  const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0]
  
  const getImageUrl = (img: any) => {
    let url = img?.image_url || img?.file
    if (!url) return null
    if (url.startsWith('http://')) url = url.replace('http://', 'https://')
    if (url.startsWith('https://')) return url
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const mainImageUrl = getImageUrl(primaryImage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-green-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Aperçu du Produit</h2>
              <p className="text-sm text-white/80">Prévisualisation détaillée</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
                {mainImageUrl ? (
                  <img src={mainImageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={64} className="text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {mediaArray.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {mediaArray.slice(0, 4).map((img: any, idx: number) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={getImageUrl(img) || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.is_active !== false
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {product.is_active !== false ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-3xl font-black text-emerald-600">
                  {parseFloat(product.base_price).toLocaleString()} <span className="text-lg font-normal text-gray-400">FCFA</span>
                </p>
                {(product as any).promo_price && (
                  <p className="text-lg text-gray-500 line-through">
                    {parseFloat((product as any).promo_price).toLocaleString()} FCFA
                  </p>
                )}
              </div>

              {/* Category & Stock */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{product.category?.name || 'Sans catégorie'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-gray-400" />
                  <span className={`text-sm font-semibold ${
                    (product.stock || 0) === 0 
                      ? 'text-red-600'
                      : (product.stock || 0) <= (product.low_stock_threshold || 10) 
                        ? 'text-amber-600' 
                        : 'text-emerald-600'
                  }`}>
                    {product.stock || 0} en stock
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Characteristics */}
              <div className="grid grid-cols-2 gap-4">
                {(product as any).delivery_time && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Livraison</p>
                      <p className="text-sm text-gray-900">{(product as any).delivery_time}</p>
                    </div>
                  </div>
                )}
                
                {(product as any).warranty_duration && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Shield size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Garantie</p>
                      <p className="text-sm text-gray-900">{(product as any).warranty_duration}</p>
                    </div>
                  </div>
                )}
                
                {(product as any).return_policy && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <RotateCcw size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-amber-600 font-medium">Retour</p>
                      <p className="text-sm text-gray-900">{(product as any).return_policy}</p>
                    </div>
                  </div>
                )}
                
                {(product as any).is_authentic && (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">Authenticité</p>
                      <p className="text-sm text-gray-900">Produit authentique</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Variants */}
              {(product as any).variants && (product as any).variants.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Variantes disponibles</h4>
                  <div className="space-y-2">
                    {(product as any).variants.map((variant: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {variant.image_url && (
                            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden">
                              <img src={variant.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {Object.entries(variant.option_values || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </p>
                            <p className="text-xs text-gray-500">Stock: {variant.stock || 0}</p>
                          </div>
                        </div>
                        {variant.price_modifier !== 0 && (
                          <span className="text-sm font-semibold text-emerald-600">
                            {variant.price_modifier > 0 ? '+' : ''}{variant.price_modifier} FCFA
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPreviewModal
