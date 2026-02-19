import React, { useState, useEffect, useMemo } from 'react'
import { Search, Package, Edit2, Trash2, X, Eye, Store, Tag, Plus, Save, TrendingUp, AlertTriangle, CheckCircle, PackageCheck, PackageMinus } from 'lucide-react'
import { productsService, Product, ProductMedia } from '../../../lib/api/productsService'
import { categoriesService, Category } from '../../../lib/api/categoriesService'
import { shopsService, Shop } from '../../../lib/api/shopsService'
import ProductFormModal, { ProductFormData } from '../../../components/admin/ProductFormModal'
import { useToast } from '../../../components/Toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

// Fonction utilitaire pour construire l'URL de l'image
const getProductImageUrl = (media?: ProductMedia[], images?: ProductMedia[]): string | null => {
  // Try media first, then images (backend returns images:product_media)
  const mediaList = media && media.length > 0 ? media : images
  if (!mediaList || mediaList.length === 0) return null
  const primaryImage = mediaList.find(m => m.is_primary) || mediaList[0]
  let url = primaryImage?.image_url || primaryImage?.file
  if (!url) return null
  // Convertir http:// en https:// pour éviter le blocage mixed content
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (url.startsWith('https://')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const SuperAdminProductsPage: React.FC = () => {
  const { showToast } = useToast()
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
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)
  const [stockValue, setStockValue] = useState<number>(0)

  const pageSize = 50
  const isDev = import.meta.env.DEV

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
        page_size: pageSize,
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        store_id: selectedShop || undefined
      })

      if (isDev) {
        console.log('Products response:', response)
        console.log('Response data type:', Array.isArray(response.data) ? 'Array' : typeof response.data)
        console.log('Response data count:', response.data?.count, 'results length:', response.data?.results?.length)
      }

      if (response.data) {
        if (Array.isArray(response.data)) {
          if (isDev) {
            console.log('⚠️ Backend returned array (no pagination support), length:', response.data.length)
          }
          setProducts(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          if (isDev) {
            console.log('✅ Backend returned paginated response, count:', response.data.count, 'results:', response.data.results.length)
          }
          setProducts(response.data.results)
          setTotalCount(response.data.count || response.data.results.length)
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
      showToast('Produit mis à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du produit', 'error')
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
      showToast('Produit supprimé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression du produit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price)) + ' FCFA'
  }

  // Gestion rapide du stock - Toggle "En stock"
  const handleToggleInStock = async (product: Product) => {
    try {
      const newStock = (product.stock ?? 0) > 0 ? 0 : 100
      await productsService.updateProductAdmin(product.id, { stock: newStock })
      loadProducts()
      showToast(newStock > 0 ? 'Produit marqué en stock' : 'Produit marqué en rupture', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du stock', 'error')
    }
  }

  // Ouvrir le modal de gestion de stock
  const handleOpenStockModal = (product: Product) => {
    setStockProduct(product)
    setStockValue(product.stock ?? 0)
    setIsStockModalOpen(true)
  }

  // Sauvegarder le stock
  const handleSaveStock = async () => {
    if (!stockProduct) return
    try {
      setActionLoading(true)
      await productsService.updateProductAdmin(stockProduct.id, { stock: stockValue })
      setIsStockModalOpen(false)
      setStockProduct(null)
      loadProducts()
      showToast('Stock mis à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du stock', 'error')
    } finally {
      setActionLoading(false)
    }
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
      
      console.log('Creating product with data:', {
        name: data.name,
        slug: data.slug,
        category_ids: data.category_ids,
        store_id: data.store_id,
        stock: data.stock_quantity
      })
      
      // 1. Créer le produit
      const result = await productsService.createProductAdmin({
        name: data.name,
        slug: data.slug,
        description: data.description,
        base_price: data.base_price,
        category_id: data.category_ids && data.category_ids.length > 0 ? data.category_ids[0] : undefined,
        category_ids: data.category_ids || [],
        store_id: data.store_id || undefined,
        stock: data.stock_quantity || 0,
        track_inventory: data.track_inventory,
        is_active: data.is_active,
        delivery_time: (data as any).delivery_time,
        warranty_duration: (data as any).warranty_duration,
        return_policy: (data as any).return_policy,
        is_authentic: (data as any).is_authentic,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        tags: data.tags
      })
      
      // 2. Uploader les images si présentes
      if (result.data?.id && data.images && data.images.length > 0) {
        try {
          await productsService.uploadProductImagesAdmin(result.data.id, data.images)
        } catch (imgErr: any) {
          console.error('Erreur upload images:', imgErr)
          // On continue même si l'upload échoue
        }
      }
      
      setIsCreateModalOpen(false)
      loadProducts()
      showToast('Produit créé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création du produit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveEditProduct = async (data: ProductFormData) => {
    if (!editingProduct) return
    
    try {
      setActionLoading(true)
      
      // 1. Update product data
      await productsService.updateProductAdmin(editingProduct.id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        base_price: data.base_price,
        category_id: data.category_ids && data.category_ids.length > 0 ? data.category_ids[0] : undefined,
        category_ids: data.category_ids || [],
        store_id: data.store_id || undefined,
        stock: data.stock_quantity || 0,
        track_inventory: data.track_inventory,
        is_active: data.is_active,
        delivery_time: (data as any).delivery_time,
        warranty_duration: (data as any).warranty_duration,
        return_policy: (data as any).return_policy,
        is_authentic: (data as any).is_authentic,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        tags: data.tags,
        images_to_delete: (data as any).images_to_delete || []
      })
      
      // 2. Upload new images if any
      if (data.images && data.images.length > 0) {
        try {
          console.log(`Uploading ${data.images.length} new images for product ${editingProduct.id}`)
          await productsService.uploadProductImagesAdmin(editingProduct.id, data.images)
        } catch (imgErr: any) {
          console.error('Erreur upload images:', imgErr)
          // Continue even if image upload fails
        }
      }
      
      setIsEditModalOpen(false)
      setEditingProduct(null)
      loadProducts()
      showToast('Produit mis à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du produit', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Stats calculations
  const activeProducts = useMemo(() => products.filter(p => p.is_active !== false).length, [products])
  const lowStockProducts = useMemo(() => products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length, [products])
  const outOfStockProducts = useMemo(() => products.filter(p => (p.stock ?? 0) === 0).length, [products])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-gray-500 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <button 
          onClick={handleCreateProduct}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
        >
          <Plus size={20} />
          Nouveau Produit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              <p className="text-xs text-gray-500">Total produits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
              <p className="text-xs text-gray-500">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
              <p className="text-xs text-gray-500">Stock faible</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
              <p className="text-xs text-gray-500">Rupture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                />
              </div>
            </form>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                  setCurrentPage(1)
                }}
                className="px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">Toutes catégories</option>
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
                className="px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">Toutes boutiques</option>
                {(shops || []).map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
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
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre premier produit</p>
            <button 
              onClick={handleCreateProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} className="inline mr-2" />
              Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="p-4">
            {/* Products Grid - Modern Card Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(products || []).map((product) => {
                const imageUrl = getProductImageUrl(product.media, product.images)
                const isActive = product.is_active !== false
                const stockLevel = product.stock ?? 0
                const stockStatus = stockLevel === 0 ? 'out' : stockLevel <= 5 ? 'low' : 'ok'
                
                return (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={40} className="text-gray-300" />
                        </div>
                      )}
                      
                      {/* Status badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {!isActive && (
                          <span className="px-2 py-0.5 bg-gray-800/80 text-white text-[10px] font-medium rounded-full">
                            Inactif
                          </span>
                        )}
                        {stockStatus === 'out' && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full">
                            Rupture
                          </span>
                        )}
                        {stockStatus === 'low' && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-medium rounded-full">
                            Stock faible
                          </span>
                        )}
                      </div>

                      {/* Quick actions overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Voir"
                        >
                          <Eye size={18} className="text-gray-700" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 bg-white rounded-full hover:bg-green-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={18} className="text-green-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {/* Shop & Category */}
                      <div className="flex items-center gap-2 mb-1">
                        {product.store && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            <Store size={10} />
                            {product.store.name}
                          </span>
                        )}
                        {product.category && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Tag size={10} />
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Price & Stock */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-green-600">
                          {formatPrice(product.base_price)}
                        </span>
                        <span className={`text-xs ${stockStatus === 'out' ? 'text-red-500' : stockStatus === 'low' ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {stockLevel} en stock
                        </span>
                      </div>

                      {/* Stock Management Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleInStock(product)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            stockLevel > 0 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title={stockLevel > 0 ? 'Marquer en rupture' : 'Marquer en stock'}
                        >
                          {stockLevel > 0 ? (
                            <>
                              <PackageCheck size={14} />
                              En stock
                            </>
                          ) : (
                            <>
                              <PackageMinus size={14} />
                              Rupture
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenStockModal(product)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                          title="Gérer le stock"
                        >
                          <Package size={14} />
                          Gérer stock
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} sur {totalPages} • {totalCount} produits
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Product Modal - Enhanced */}
      {isViewModalOpen && viewingProduct && (() => {
        const getFullImageUrl = (url: string | undefined): string | null => {
          if (!url) return null
          if (url.startsWith('http://')) url = url.replace('http://', 'https://')
          if (url.startsWith('https://')) return url
          return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
        }
        const allImages = (viewingProduct.media || viewingProduct.images || [])
          .map(img => getFullImageUrl(img.image_url || img.file)).filter(Boolean) as string[]
        const mainImage = getProductImageUrl(viewingProduct.media, viewingProduct.images)
        const stockStatus = (viewingProduct as any).track_inventory === false ? 'illimité' : `${viewingProduct.stock ?? 0} unités`
        const isInStock = (viewingProduct as any).track_inventory === false || (viewingProduct.stock ?? 0) > 0
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
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
                {/* Image Section */}
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
                {/* Info Section */}
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
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Prix</p>
                    <span className="text-2xl font-bold text-indigo-600">{formatPrice(viewingProduct.base_price)}</span>
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
                      <div className="flex items-center gap-1 mb-1"><Tag size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Catégorie</span></div>
                      <p className="font-medium text-gray-900 text-sm truncate">{viewingProduct.category?.name || '-'}</p>
                    </div>
                  </div>
                  {(viewingProduct as any).tags && (viewingProduct as any).tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(viewingProduct as any).tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}
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
              <button onClick={() => { setIsViewModalOpen(false); handleEditProduct(viewingProduct) }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <Edit2 size={16} /> Modifier
              </button>
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Fermer
              </button>
            </div>
          </div>
        </div>
        )
      })()}

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
            description: editingProduct.description || '',
            base_price: editingProduct.base_price,
            category_id: editingProduct.category?.id || (editingProduct as any).category_id || null,
            category_ids: (() => {
              // Try multiple extraction strategies
              let ids: number[] = []
              
              // Strategy 1: categories array with nested category objects
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
            store_id: editingProduct.store?.id || editingProduct.shop?.id || (editingProduct as any).store_id || null,
            stock_quantity: editingProduct.stock || 0,
            track_inventory: (editingProduct as any).track_inventory ?? false,
            is_active: editingProduct.is_active !== false,
            existing_images: (editingProduct.media || (editingProduct as any).images || [])
              .map((m: any) => {
                let url = m.image_url || m.file || ''
                if (!url) return ''
                if (url.startsWith('http://')) url = url.replace('http://', 'https://')
                if (url.startsWith('https://')) return url
                return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
              })
              .filter(Boolean),
            delivery_time: (editingProduct as any).delivery_time,
            warranty_duration: (editingProduct as any).warranty_duration,
            return_policy: (editingProduct as any).return_policy,
            is_authentic: (editingProduct as any).is_authentic,
            meta_title: (editingProduct as any).meta_title || '',
            meta_description: (editingProduct as any).meta_description || '',
            tags: (editingProduct as any).tags || []
          } as any}
          categories={categories}
          shops={shops}
          isLoading={actionLoading}
          title="Modifier le Produit"
        />
      )}

      {/* Stock Management Modal */}
      {isStockModalOpen && stockProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Gérer le stock</h2>
              <button
                onClick={() => {
                  setIsStockModalOpen(false)
                  setStockProduct(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Produit:</p>
                <p className="font-medium text-gray-900">{stockProduct.name}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité en stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockValue}
                  onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold text-center"
                />
              </div>

              {/* Quick stock buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setStockValue(0)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Rupture (0)
                </button>
                <button
                  onClick={() => setStockValue(10)}
                  className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                >
                  Faible (10)
                </button>
                <button
                  onClick={() => setStockValue(100)}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Normal (100)
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsStockModalOpen(false)
                    setStockProduct(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveStock}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
        </div>
      )}
    </div>
  )
}

export default SuperAdminProductsPage
