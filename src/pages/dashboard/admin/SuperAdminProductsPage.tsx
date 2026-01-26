import React, { useState, useEffect } from 'react'
import { Search, Package, Edit2, Trash2, X, Eye, Store, Tag, Plus, Save } from 'lucide-react'
import { productsService, Product } from '../../../lib/api/productsService'
import { categoriesService, Category } from '../../../lib/api/categoriesService'
import { shopsService, Shop } from '../../../lib/api/shopsService'
import ProductFormModal, { ProductFormData } from '../../../components/admin/ProductFormModal'

const SuperAdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedShop, setSelectedShop] = useState<number | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [actionLoading, setActionLoading] = useState(false)

  const pageSize = 20

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [currentPage, searchQuery, selectedCategory, selectedShop])

  const loadInitialData = async () => {
    try {
      // Load categories
      const catResponse = await categoriesService.getCategories()
      if (catResponse.data) {
        setCategories(Array.isArray(catResponse.data) ? catResponse.data : [])
      }
      
      // Load shops
      const shopResponse = await shopsService.getAllShops()
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
      
      const response = await productsService.getAllProductsAdmin({
        page: currentPage,
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        store_id: selectedShop || undefined
      })

      console.log('Products response:', response)

      if (response.data) {
        if (Array.isArray(response.data)) {
          setProducts(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setProducts(response.data.results)
          setTotalCount(response.data.count)
        } else {
          setProducts([])
          setTotalCount(0)
        }
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      // Fallback to public endpoint
      try {
        const publicResponse = await productsService.getProducts({
          page: currentPage,
          search: searchQuery || undefined,
          category_id: selectedCategory || undefined
        })
        if (publicResponse.data) {
          if (Array.isArray(publicResponse.data)) {
            setProducts(publicResponse.data)
            setTotalCount(publicResponse.data.length)
          } else if (publicResponse.data.results) {
            setProducts(publicResponse.data.results)
            setTotalCount(publicResponse.data.count)
          }
        }
      } catch {
        setError(err.message || 'Erreur lors du chargement des produits')
      }
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
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      base_price: product.base_price
    })
    setIsEditModalOpen(true)
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return
    
    try {
      setActionLoading(true)
      await productsService.updateProductAdmin(editingProduct.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        base_price: formData.base_price
      })
      setIsEditModalOpen(false)
      setEditingProduct(null)
      loadProducts()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour du produit')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      setActionLoading(true)
      await productsService.deleteProductAdmin(productToDelete.id)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      loadProducts()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression du produit')
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price)) + ' FCFA'
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  // Flatten categories for select
  const flattenCategoriesForSelect = (cats: Category[], prefix: string = ''): Array<{ id: number; name: string }> => {
    let result: Array<{ id: number; name: string }> = []
    for (const cat of cats) {
      result.push({ id: cat.id, name: prefix + cat.name })
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategoriesForSelect(cat.children, prefix + '— '))
      }
    }
    return result
  }

  const flatCategories = flattenCategoriesForSelect(categories || [])

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true)
  }

  const handleSaveNewProduct = async (data: ProductFormData) => {
    try {
      setActionLoading(true)
      await productsService.createProductAdmin({
        name: data.name,
        slug: data.slug,
        description: data.description,
        base_price: data.base_price,
        category: data.category_id || 0,
        store: data.store_id || undefined
      })
      setIsCreateModalOpen(false)
      loadProducts()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création du produit')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditWithModal = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleSaveEditProduct = async (data: ProductFormData) => {
    if (!editingProduct) return
    
    try {
      setActionLoading(true)
      await productsService.updateProductAdmin(editingProduct.id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        base_price: data.base_price
      })
      setIsEditModalOpen(false)
      setEditingProduct(null)
      loadProducts()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour du produit')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} produit{totalCount > 1 ? 's' : ''} au total
          </p>
        </div>
        <button 
          onClick={handleCreateProduct}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          Nouveau Produit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {flatCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedShop || ''}
              onChange={(e) => {
                setSelectedShop(e.target.value ? Number(e.target.value) : null)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Toutes les boutiques</option>
              {(shops || []).map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Réessayer
            </button>
          </div>
        ) : (products || []).length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun produit trouvé
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Boutique
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(products || []).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                            {product.media && product.media[0]?.image_url ? (
                              <img 
                                src={product.media[0].image_url} 
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="text-gray-400" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{product.store?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{product.category?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(product.base_price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Product Modal */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Détails du produit</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-6">
                <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {viewingProduct.media && viewingProduct.media[0]?.image_url ? (
                    <img 
                      src={viewingProduct.media[0].image_url} 
                      alt={viewingProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{viewingProduct.name}</h3>
                  <p className="text-gray-500 mt-1">{viewingProduct.slug}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700">
                        Boutique: <strong>{viewingProduct.store?.name || '-'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700">
                        Catégorie: <strong>{viewingProduct.category?.name || '-'}</strong>
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(viewingProduct.base_price)}
                    </span>
                  </div>
                </div>
              </div>
              
              {viewingProduct.description && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{viewingProduct.description}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Modifier le produit</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                <input
                  type="number"
                  value={formData.base_price || ''}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Supprimer le produit</h2>
                  <p className="text-sm text-gray-600">Cette action est irréversible</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer le produit <strong>{productToDelete.name}</strong> ?
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Suppression...
                    </div>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      <ProductFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewProduct}
        categories={categories}
        shops={shops}
        isLoading={actionLoading}
        title="Nouveau Produit"
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingProduct(null)
          }}
          onSave={handleSaveEditProduct}
          initialData={{
            name: editingProduct.name,
            slug: editingProduct.slug,
            description: editingProduct.description,
            base_price: editingProduct.base_price,
            category_id: editingProduct.category?.id,
            store_id: editingProduct.store?.id,
            existing_images: editingProduct.media?.map(m => m.image_url || '').filter(Boolean)
          }}
          categories={categories}
          shops={shops}
          isLoading={actionLoading}
          title="Modifier le Produit"
        />
      )}
    </div>
  )
}

export default SuperAdminProductsPage
