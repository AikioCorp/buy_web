import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, Plus, Search, Edit, Trash2,
  AlertCircle, CheckCircle, XCircle, Loader2,
  Grid, List, Image as ImageIcon, Eye
} from 'lucide-react'
import { productsService, Product } from '../../lib/api/productsService'
import { shopsService, Shop } from '../../lib/api/shopsService'
import ProductFormModal from '../../components/dashboard/ProductFormModal'
import ProductPreviewModal from '../../components/dashboard/ProductPreviewModal'

// Product Card Component
const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete,
  onPreview,
  viewMode 
}: { 
  product: Product
  onEdit: () => void
  onDelete: () => void
  onPreview: () => void
  viewMode: 'grid' | 'list'
}) => {
  // Backend returns 'images' but interface uses 'media'
  const mediaArray = (product as any).images || product.media || []
  const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0]
  
  // Construire l'URL de l'image (gérer les chemins relatifs et absolus)
  const getImageUrl = () => {
    let url = primaryImage?.image_url || primaryImage?.file
    if (!url) return null
    // Convertir http:// en https:// pour éviter le blocage mixed content
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://')
    }
    // Si c'est déjà une URL absolue, la retourner
    if (url.startsWith('https://')) return url
    // Sinon, construire l'URL avec le backend
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml'
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }
  const imageUrl = getImageUrl()

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Image + Info (mobile: row, desktop: separate) */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={24} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category?.name || 'Sans catégorie'}</p>
              {/* Mobile: show price here */}
              <p className="sm:hidden font-bold text-emerald-600 mt-1">{parseFloat(product.base_price).toLocaleString()} XOF</p>
            </div>
          </div>

          {/* Price - Desktop only */}
          <div className="hidden sm:block text-right">
            <p className="font-bold text-gray-900">{parseFloat(product.base_price).toLocaleString()} XOF</p>
            <p className="text-sm text-gray-500">Stock: {product.stock || 0}</p>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.is_active !== false
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {product.is_active !== false ? 'Actif' : 'Inactif'}
              </span>
              <span className="sm:hidden text-xs text-gray-500">Stock: {product.stock || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onPreview}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Aperçu"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view - Ultra pretty card
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            product.is_active !== false
              ? 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-gray-600/90 text-white'
          }`}>
            {product.is_active !== false ? '● Actif' : '○ Inactif'}
          </span>
          {product.is_low_stock && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-sm shadow-lg shadow-amber-500/30">
              ⚠ Stock bas
            </span>
          )}
          {(product.stock || 0) === 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white backdrop-blur-sm shadow-lg shadow-red-500/30">
              ✕ Rupture
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2">
          <button
            onClick={onPreview}
            className="p-3 bg-white rounded-xl text-gray-700 hover:bg-blue-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
            title="Aperçu"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={onEdit}
            className="p-3 bg-white rounded-xl text-gray-700 hover:bg-emerald-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
            title="Modifier"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={onDelete}
            className="p-3 bg-white rounded-xl text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
            title="Supprimer"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate mb-1 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{product.category?.name || 'Sans catégorie'}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-lg font-black text-emerald-600">
            {parseFloat(product.base_price).toLocaleString()} <span className="text-xs font-normal text-gray-400">XOF</span>
          </p>
          <p className={`text-xs font-semibold px-2 py-1 rounded-full ${
            (product.stock || 0) === 0 
              ? 'bg-red-100 text-red-600'
              : (product.stock || 0) <= (product.low_stock_threshold || 10) 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-gray-100 text-gray-600'
          }`}>
            {product.stock || 0} unités
          </p>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
const EmptyState = ({ onAddProduct, hasStore }: { onAddProduct: () => void, hasStore: boolean }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
    <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
      <Package size={40} className="text-emerald-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      {hasStore 
        ? "Vous n'avez pas encore ajouté de produits. Commencez par créer votre premier produit pour le mettre en vente."
        : "Vous devez d'abord créer votre boutique avant de pouvoir ajouter des produits."
      }
    </p>
    {hasStore ? (
      <button
        onClick={onAddProduct}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
      >
        <Plus size={20} />
        Ajouter mon premier produit
      </button>
    ) : (
      <Link
        to="/dashboard/store"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
      >
        Créer ma boutique
      </Link>
    )}
  </div>
)

// Delete Confirmation Modal
const DeleteConfirmModal = ({ 
  product, 
  onConfirm, 
  onCancel,
  loading 
}: { 
  product: Product
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} className="text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
        Supprimer ce produit ?
      </h3>
      <p className="text-gray-500 text-center mb-6">
        Êtes-vous sûr de vouloir supprimer <strong>{product.name}</strong> ? Cette action est irréversible.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 size={18} />
              Supprimer
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<Shop | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewingProduct, setPreviewingProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger la boutique
      const storeResponse = await shopsService.getMyShop()
      if (storeResponse.data) {
        setStore(storeResponse.data)
        
        // Show warning if shop is not approved
        if (!storeResponse.data.is_active) {
          setMessage({ 
            type: 'error', 
            text: 'Votre boutique doit être approuvée avant de pouvoir ajouter des produits.' 
          })
        }
      }

      // Charger les produits
      const productsResponse = await productsService.getMyProducts()
      console.log('📦 Products response:', productsResponse)
      if (productsResponse.data) {
        // Backend returns { results: [...], count: N } format
        if (Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data)
        } else if (productsResponse.data.results && Array.isArray(productsResponse.data.results)) {
          setProducts(productsResponse.data.results)
        } else {
          setProducts([])
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    // Check if shop is approved
    if (!store?.is_active) {
      setMessage({ 
        type: 'error', 
        text: 'Votre boutique doit être approuvée avant de pouvoir ajouter des produits.' 
      })
      return
    }
    setEditingProduct(null)
    setIsFormModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsFormModalOpen(true)
  }

  const handlePreviewProduct = (product: Product) => {
    setPreviewingProduct(product)
    setIsPreviewModalOpen(true)
  }

  const handleEditFromPreview = () => {
    if (previewingProduct) {
      setEditingProduct(previewingProduct)
      setIsPreviewModalOpen(false)
      setIsFormModalOpen(true)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    try {
      setDeleteLoading(true)
      const response = await productsService.deleteProduct(deletingProduct.id)
      if (response.error) {
        throw new Error(response.error)
      }
      
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id))
      setMessage({ type: 'success', text: 'Produit supprimé avec succès' })
      setDeletingProduct(null)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSuccess = () => {
    loadData()
    setMessage({ type: 'success', text: editingProduct ? 'Produit mis à jour!' : 'Produit créé!' })
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' 
      || (filterStatus === 'active' && product.is_active !== false)
      || (filterStatus === 'inactive' && product.is_active === false)
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active !== false).length,
    lowStock: products.filter(p => p.is_low_stock).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
          <p className="text-gray-500 mt-1">Gérez votre catalogue de produits</p>
        </div>
        {store && (
          <button
            onClick={handleAddProduct}
            className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
          >
            <Plus size={20} />
            Ajouter un produit
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-blue-100 text-sm">Total produits</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-emerald-100 text-sm">Actifs</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-amber-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.lowStock}</p>
                <p className="text-amber-100 text-sm">Stock bas</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{products.filter(p => p.is_active === false).length}</p>
                <p className="text-purple-100 text-sm">Inactifs</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <XCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'active', label: 'Actifs' },
                { id: 'inactive', label: 'Inactifs' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filterStatus === filter.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View mode */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        products.length === 0 ? (
          <EmptyState onAddProduct={handleAddProduct} hasStore={!!store} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-500">Aucun produit ne correspond à votre recherche</p>
          </div>
        )
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onPreview={() => handlePreviewProduct(product)}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => setDeletingProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Product Preview Modal */}
      <ProductPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setPreviewingProduct(null)
        }}
        product={previewingProduct}
        onEdit={handleEditFromPreview}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingProduct(null)
        }}
        onSuccess={loadData}
        product={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeletingProduct(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

export default ProductsPage
