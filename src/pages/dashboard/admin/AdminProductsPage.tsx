import React, { useState, useEffect } from 'react'
import { 
  Search, Package, Edit2, Trash2, X, Eye, Store,
  CheckCircle, XCircle, AlertTriangle, Ban, Loader2, RefreshCw,
  LayoutGrid, List, Plus
} from 'lucide-react'
import { productsService, Product, ProductMedia } from '../../../lib/api/productsService'
import { categoriesService, Category } from '../../../lib/api/categoriesService'
import { shopsService, Shop } from '../../../lib/api/shopsService'
import { usePermissions } from '../../../hooks/usePermissions'
import { useToast } from '../../../components/Toast'
import ProductFormModal, { ProductFormData } from '../../../components/admin/ProductFormModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apibuy.buymore.ml'

// Fonction utilitaire pour construire l'URL de l'image
const getProductImageUrl = (media?: ProductMedia[], images?: ProductMedia[]): string | null => {
  const mediaList = media && media.length > 0 ? media : images
  if (!mediaList || mediaList.length === 0) return null
  const primaryImage = mediaList.find(m => m.is_primary) || mediaList[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast()
  const { 
    canViewProducts, 
    canEditProducts, 
    canDeleteProducts, 
    canModerateProducts 
  } = usePermissions()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [actionLoading, setActionLoading] = useState(false)

  const pageSize = 50

  // Stats
  const stats = {
    total: totalCount,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [currentPage, searchQuery])

  const loadInitialData = async () => {
    try {
      const [catResponse, shopResponse] = await Promise.all([
        categoriesService.getCategories(),
        shopsService.getAllShops()
      ])
      if (catResponse.data) {
        setCategories(Array.isArray(catResponse.data) ? catResponse.data : [])
      }
      if (shopResponse.data) {
        if (Array.isArray(shopResponse.data)) {
          setShops(shopResponse.data)
        } else if (shopResponse.data.results) {
          setShops(shopResponse.data.results)
        }
      }
    } catch (err) {
      console.error('Erreur chargement données initiales:', err)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productsService.getAllProductsAdmin({ page: currentPage, page_size: pageSize, search: searchQuery })
      if (response.data) {
        if (Array.isArray(response.data)) {
          setProducts(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setProducts(response.data.results)
          setTotalCount(response.data.count)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadProducts()
  }

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product)
    setIsViewModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    if (!canEditProducts()) return
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setIsCreateModalOpen(true)
  }

  const handleSaveProduct = async (data: ProductFormData) => {
    try {
      setActionLoading(true)
      
      if (editingProduct) {
        // Update existing product - Use ADMIN endpoint
        await productsService.updateProductAdmin(editingProduct.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          base_price: data.base_price,
          stock: data.stock_quantity,
          track_inventory: data.track_inventory,
          is_active: data.is_active,
          category_id: data.category_ids && data.category_ids.length > 0 ? data.category_ids[0] : data.category_id,
          category_ids: data.category_ids || [],
          store_id: data.store_id,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          tags: data.tags,
          images_to_delete: (data as any).images_to_delete || []
        } as any)
        
        // Upload new images if any - Use ADMIN endpoint
        if (data.images && data.images.length > 0) {
          try {
            await productsService.uploadProductImagesAdmin(editingProduct.id, data.images)
          } catch (imgErr: any) {
            console.error('Erreur upload images:', imgErr)
            showToast('Produit mis à jour mais erreur lors de l\'upload des images', 'warning')
          }
        }
        
        showToast('Produit mis à jour avec succès', 'success')
      } else {
        // Create new product - Use ADMIN endpoint
        const result = await productsService.createProductAdmin({
          name: data.name,
          slug: data.slug,
          description: data.description,
          base_price: data.base_price,
          stock: data.stock_quantity,
          track_inventory: data.track_inventory,
          is_active: data.is_active,
          category_id: data.category_ids && data.category_ids.length > 0 ? data.category_ids[0] : data.category_id,
          category_ids: data.category_ids || [],
          store_id: data.store_id,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          tags: data.tags
        } as any)
        
        // Upload images if any - Use ADMIN endpoint
        if (result.data?.id && data.images && data.images.length > 0) {
          try {
            await productsService.uploadProductImagesAdmin(result.data.id, data.images)
          } catch (imgErr: any) {
            console.error('Erreur upload images:', imgErr)
            showToast('Produit créé mais erreur lors de l\'upload des images', 'warning')
          }
        }
        
        showToast('Produit créé avec succès', 'success')
      }
      
      setIsEditModalOpen(false)
      setIsCreateModalOpen(false)
      setEditingProduct(null)
      loadProducts()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'enregistrement', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    if (!canDeleteProducts()) return
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete || !canDeleteProducts()) return
    try {
      setActionLoading(true)
      await productsService.deleteProductAdmin(productToDelete.id)
      setIsDeleteModalOpen(false)
      showToast('Produit supprimé avec succès', 'success')
      loadProducts()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (product: Product) => {
    if (!canModerateProducts()) return
    try {
      await productsService.updateProductAdmin(product.id, { is_active: !product.is_active } as any)
      showToast(product.is_active ? 'Produit désactivé' : 'Produit activé', 'success')
      loadProducts()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la modification', 'error')
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  // No permission warning
  if (!canViewProducts()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Ban className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-500">Vous n'avez pas la permission de voir les produits.</p>
        </div>
      </div>
    )
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadProducts} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Gestion des Produits
          </h1>
          <p className="text-gray-500 mt-1">{totalCount} produits enregistrés</p>
        </div>
        {canEditProducts() && (
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/25"
          >
            <Plus size={20} />
            Nouveau produit
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-blue-100 text-sm">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-green-100 text-sm">Actifs</p>
          <p className="text-2xl font-bold mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-gray-100 text-sm">Inactifs</p>
          <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100"
            />
          </form>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}>
                <LayoutGrid size={20} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}>
                <List size={20} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
            </div>
            <button onClick={loadProducts} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">
              <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun produit trouvé</h3>
          <p className="text-gray-500 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-40 bg-gray-100 relative">
                {getProductImageUrl(product.media, (product as any).images) ? (
                  <img src={getProductImageUrl(product.media, (product as any).images)!} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {product.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-lg font-bold text-blue-600 mt-1">{parseFloat(product.base_price || '0').toLocaleString()} FCFA</p>
                {product.store && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 truncate">
                    <Store size={12} />
                    {typeof product.store === 'object' ? product.store.name : product.store}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => handleViewProduct(product)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="Voir">
                    <Eye size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    {canModerateProducts() && (
                      <button onClick={() => handleToggleActive(product)} className={`p-2 rounded-lg ${product.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={product.is_active ? 'Désactiver' : 'Activer'}>
                        <Ban size={16} />
                      </button>
                    )}
                    {canEditProducts() && (
                      <button onClick={() => handleEditProduct(product)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDeleteProducts() && (
                      <button onClick={() => handleDeleteClick(product)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Produit</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Prix</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Boutique</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                        {(product.media?.[0] as any)?.image_url || (product.media?.[0] as any)?.file ? (
                          <img src={(product.media?.[0] as any)?.image_url || (product.media?.[0] as any)?.file} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock || 0}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-blue-600">{parseFloat(product.base_price || '0').toLocaleString()} FCFA</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {product.store ? (typeof product.store === 'object' ? product.store.name : product.store) : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {product.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100">
                      <button onClick={() => handleViewProduct(product)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg" title="Voir">
                        <Eye size={18} />
                      </button>
                      {canEditProducts() && (
                        <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg" title="Modifier">
                          <Edit2 size={18} />
                        </button>
                      )}
                      {canDeleteProducts() && (
                        <button onClick={() => handleDeleteClick(product)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg" title="Supprimer">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50">
              Précédent
            </button>
            <span className="px-4 text-sm font-bold text-gray-900">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* View Modal - Enhanced */}
      {isViewModalOpen && viewingProduct && (() => {
        const mainImage = getProductImageUrl(viewingProduct.media, viewingProduct.images)
        const allImages = (viewingProduct.media || viewingProduct.images || [])
          .map((img: any) => {
            let url = img.image_url || img.file
            if (!url) return null
            if (url.startsWith('http://')) url = url.replace('http://', 'https://')
            if (url.startsWith('https://')) return url
            return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
          }).filter(Boolean) as string[]
        const stockStatus = (viewingProduct as any).track_inventory === false ? 'illimité' : `${viewingProduct.stock ?? 0} unités`
        const isInStock = (viewingProduct as any).track_inventory === false || (viewingProduct.stock ?? 0) > 0
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center gap-3">
                  <Eye className="text-white" size={24} />
                  <h2 className="text-xl font-bold text-white">Détails du produit</h2>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      {mainImage ? (
                        <img src={mainImage} alt={viewingProduct.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="text-gray-300" size={64} /></div>
                      )}
                    </div>
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {allImages.slice(0, 4).map((imgUrl, idx) => (
                          <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img src={imgUrl} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{viewingProduct.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingProduct.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {viewingProduct.is_active !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm font-mono">{viewingProduct.slug}</p>
                      <p className="text-gray-400 text-xs">ID: {viewingProduct.id}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">Prix</p>
                      <span className="text-2xl font-bold text-blue-600">{parseFloat(viewingProduct.base_price || '0').toLocaleString()} FCFA</span>
                    </div>
                    <div className={`rounded-xl p-4 ${isInStock ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-2">
                        {isInStock ? <CheckCircle className="text-green-600" size={20} /> : <AlertTriangle className="text-red-600" size={20} />}
                        <div>
                          <p className={`font-medium ${isInStock ? 'text-green-700' : 'text-red-700'}`}>{isInStock ? 'En stock' : 'Rupture'}</p>
                          <p className="text-xs text-gray-600">Stock: {stockStatus}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1"><Store size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Boutique</span></div>
                        <p className="font-medium text-gray-900 text-sm truncate">{viewingProduct.shop?.name || viewingProduct.store?.name || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1"><Package size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Catégorie</span></div>
                        <p className="font-medium text-gray-900 text-sm truncate">{viewingProduct.category?.name || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {viewingProduct.description && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{viewingProduct.description}</p>
                  </div>
                )}
                {((viewingProduct as any).meta_title || (viewingProduct as any).meta_description) && (
                  <div className="mt-4 bg-purple-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-purple-600 mb-2">SEO</p>
                    {(viewingProduct as any).meta_title && <p className="text-sm text-gray-700"><strong>Titre:</strong> {(viewingProduct as any).meta_title}</p>}
                    {(viewingProduct as any).meta_description && <p className="text-sm text-gray-600 mt-1"><strong>Description:</strong> {(viewingProduct as any).meta_description}</p>}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                {canEditProducts() && (
                  <button onClick={() => { setIsViewModalOpen(false); handleEditProduct(viewingProduct) }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Edit2 size={16} /> Modifier
                  </button>
                )}
                <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Edit Modal */}
      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        initialData={editingProduct ? {
          name: editingProduct.name,
          slug: editingProduct.slug,
          description: editingProduct.description || '',
          base_price: editingProduct.base_price,
          category_id: editingProduct.category?.id || null,
          category_ids: (() => {
            // Extract category IDs with multiple strategies
            let ids: number[] = []
            
            // Strategy 1: categories array
            if ((editingProduct as any).categories && Array.isArray((editingProduct as any).categories)) {
              ids = (editingProduct as any).categories
                .map((c: any) => c.category?.id || c.category_id || c.id)
                .filter((id: any) => id != null)
            }
            
            // Strategy 2: single category object
            if (ids.length === 0 && editingProduct.category?.id) {
              ids = [editingProduct.category.id]
            }
            
            // Strategy 3: category_id field
            if (ids.length === 0 && (editingProduct as any).category_id) {
              ids = [(editingProduct as any).category_id]
            }
            
            return ids
          })(),
          store_id: (editingProduct.store?.id || editingProduct.shop?.id) || null,
          stock_quantity: editingProduct.stock || 0,
          track_inventory: (editingProduct as any).track_inventory ?? false,
          sku: '',
          is_active: editingProduct.is_active ?? true,
          variants: [],
          images: [],
          existing_images: (editingProduct.media || editingProduct.images || []).map((m: any) => {
            let url = m.image_url || m.file || ''
            if (!url) return ''
            if (url.startsWith('http://')) url = url.replace('http://', 'https://')
            if (url.startsWith('https://')) return url
            return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
          }).filter(Boolean) || [],
          meta_title: (editingProduct as any).meta_title || '',
          meta_description: (editingProduct as any).meta_description || '',
          tags: (editingProduct as any).tags || []
        } : undefined}
        categories={categories}
        shops={shops}
        isLoading={actionLoading}
        title="Modifier le produit"
      />

      {/* Create Modal */}
      <ProductFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveProduct}
        categories={categories}
        shops={shops}
        isLoading={actionLoading}
        title="Nouveau produit"
      />

      {/* Delete Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer le produit</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{productToDelete.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100" disabled={actionLoading}>
                Annuler
              </button>
              <button onClick={handleConfirmDelete} disabled={actionLoading} className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
