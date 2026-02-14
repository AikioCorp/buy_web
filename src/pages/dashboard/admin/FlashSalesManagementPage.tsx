import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Loader2, Clock, Calendar, Zap, Search, X, Save, Image as ImageIcon, Percent, DollarSign } from 'lucide-react'
import { flashSalesService, FlashSale, FlashSaleProduct } from '../../../lib/api/flashSalesService'
import { productsService, Product } from '../../../lib/api/productsService'
import { useToast } from '../../../components/Toast'

export default function FlashSalesManagementPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [selectedSale, setSelectedSale] = useState<FlashSale | null>(null)
  const [saleProducts, setSaleProducts] = useState<FlashSaleProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [editModal, setEditModal] = useState<{ type: 'create' | 'edit'; sale?: FlashSale } | null>(null)
  const [formData, setFormData] = useState<Partial<FlashSale>>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    bg_color: 'from-red-500 to-orange-500'
  })

  // Couleurs prédéfinies pour les gradients
  const PRESET_GRADIENTS = [
    { value: 'from-red-500 to-orange-500', label: 'Rouge → Orange', preview: 'linear-gradient(to right, #ef4444, #f97316)' },
    { value: 'from-purple-600 to-pink-600', label: 'Violet → Rose', preview: 'linear-gradient(to right, #9333ea, #db2777)' },
    { value: 'from-blue-600 to-indigo-700', label: 'Bleu → Indigo', preview: 'linear-gradient(to right, #2563eb, #4338ca)' },
    { value: 'from-green-600 to-emerald-500', label: 'Vert → Émeraude', preview: 'linear-gradient(to right, #16a34a, #10b981)' },
    { value: 'from-orange-500 to-red-600', label: 'Orange → Rouge', preview: 'linear-gradient(to right, #f97316, #dc2626)' },
    { value: 'from-cyan-500 to-blue-600', label: 'Cyan → Bleu', preview: 'linear-gradient(to right, #06b6d4, #2563eb)' },
    { value: 'from-yellow-500 to-orange-500', label: 'Jaune → Orange', preview: 'linear-gradient(to right, #eab308, #f97316)' },
    { value: 'from-pink-500 to-rose-600', label: 'Rose → Rose foncé', preview: 'linear-gradient(to right, #ec4899, #e11d48)' },
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSale) {
      loadSaleProducts(selectedSale.id!)
    }
  }, [selectedSale])

  const loadData = async () => {
    setLoading(true)
    try {
      const [salesRes, productsRes] = await Promise.all([
        flashSalesService.getFlashSales(true),
        productsService.getProducts({ page: 1, page_size: 1000, light: true })
      ])
      
      if (salesRes.data) setFlashSales(salesRes.data)
      if (productsRes.data) {
        const productList = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data as any).results || []
        setProducts(productList)
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
      showToast('Erreur lors du chargement', 'error')
    }
    setLoading(false)
  }

  const loadSaleProducts = async (saleId: number) => {
    try {
      const res = await flashSalesService.getFlashSaleProducts(saleId)
      if (res.data) setSaleProducts(res.data)
    } catch (error) {
      console.error('Erreur chargement produits:', error)
    }
  }

  const handleCreateOrUpdate = async () => {
    try {
      if (!formData.title || !formData.start_date || !formData.end_date) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error')
        return
      }

      if (editModal?.type === 'create') {
        const res = await flashSalesService.createFlashSale(formData as any)
        if (res.data) {
          setFlashSales(prev => [res.data!, ...prev])
          showToast('Flash Sale créée avec succès', 'success')
        }
      } else if (editModal?.sale?.id) {
        const res = await flashSalesService.updateFlashSale(editModal.sale.id, formData)
        if (res.data) {
          setFlashSales(prev => prev.map(s => s.id === res.data!.id ? res.data! : s))
          if (selectedSale?.id === res.data.id) setSelectedSale(res.data)
          showToast('Flash Sale mise à jour', 'success')
        }
      }

      setEditModal(null)
      setFormData({ title: '', description: '', start_date: '', end_date: '', is_active: true })
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette Flash Sale ?')) return
    
    try {
      await flashSalesService.deleteFlashSale(id)
      setFlashSales(prev => prev.filter(s => s.id !== id))
      if (selectedSale?.id === id) {
        setSelectedSale(null)
        setSaleProducts([])
      }
      showToast('Flash Sale supprimée', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la suppression', 'error')
    }
  }

  const handleAddProduct = async (productId: number) => {
    if (!selectedSale) return

    try {
      const res = await flashSalesService.addProductToFlashSale(selectedSale.id!, productId)
      if (res.data) {
        setSaleProducts(prev => [...prev, res.data!])
        showToast('Produit ajouté', 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de l\'ajout', 'error')
    }
  }

  const handleRemoveProduct = async (id: number) => {
    try {
      await flashSalesService.removeProductFromFlashSale(id)
      setSaleProducts(prev => prev.filter(p => p.id !== id))
      showToast('Produit retiré', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la suppression', 'error')
    }
  }

  const openCreateModal = () => {
    setFormData({ title: '', description: '', start_date: '', end_date: '', is_active: true, bg_color: 'from-red-500 to-orange-500' })
    setEditModal({ type: 'create' })
  }

  const openEditModal = (sale: FlashSale) => {
    setFormData({
      title: sale.title,
      description: sale.description,
      start_date: sale.start_date.slice(0, 16),
      end_date: sale.end_date.slice(0, 16),
      is_active: sale.is_active,
      bg_color: sale.bg_color || 'from-red-500 to-orange-500'
    })
    setEditModal({ type: 'edit', sale })
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff <= 0) return 'Terminée'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}j ${hours}h restantes`
    return `${hours}h restantes`
  }

  const isActive = (sale: FlashSale) => {
    const now = new Date()
    const start = new Date(sale.start_date)
    const end = new Date(sale.end_date)
    return sale.is_active && now >= start && now <= end
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Zap className="w-8 h-8 text-orange-600" />
          Gestion Flash Sales
        </h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Flash Sale
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des Flash Sales */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-lg mb-3">Campagnes ({flashSales.length})</h2>
          {flashSales.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune Flash Sale</p>
            </div>
          ) : (
            flashSales.map(sale => (
              <div
                key={sale.id}
                onClick={() => setSelectedSale(sale)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSale?.id === sale.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{sale.title}</h3>
                    {sale.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sale.description}</p>
                    )}
                  </div>
                  {isActive(sale) && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-3">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeRemaining(sale.end_date)}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(sale); }}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(sale.id!); }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gestion des produits */}
        {selectedSale ? (
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {/* Produits actuels */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Produits en promo ({saleProducts.length})
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {saleProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun produit</p>
                    </div>
                  ) : (
                    saleProducts.map(sp => {
                      const product = sp.product
                      const imageUrl = product?.images?.[0]?.image_url || product?.media?.[0]?.image_url
                      
                      return (
                        <div key={sp.id} className="group flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product?.name} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{product?.name || `Produit #${sp.product_id}`}</h4>
                            <p className="text-sm text-orange-600 font-medium">{product?.base_price ? `${product.base_price} FCFA` : 'Prix non défini'}</p>
                            {sp.discount_percent && (
                              <p className="text-xs text-green-600 font-semibold">-{sp.discount_percent}%</p>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveProduct(sp.id!)} 
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Ajouter des produits */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Ajouter des produits
                </h3>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2 max-h-[540px] overflow-y-auto">
                  {products
                    .filter(p => 
                      p.name.toLowerCase().includes(search.toLowerCase()) && 
                      !saleProducts.some(sp => sp.product_id === p.id)
                    )
                    .slice(0, 30)
                    .map(p => {
                      const imageUrl = p.images?.[0]?.image_url || (p as any).media?.[0]?.image_url
                      
                      return (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all group"
                          onClick={() => handleAddProduct(p.id)}
                        >
                          {imageUrl ? (
                            <img src={imageUrl} alt={p.name} className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate text-sm">{p.name}</h4>
                            <p className="text-xs text-emerald-600 font-semibold">{p.base_price} FCFA</p>
                          </div>
                          
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={20} className="text-emerald-600" />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center bg-white rounded-xl border border-gray-200 p-12">
            <div className="text-center text-gray-400">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une Flash Sale pour gérer ses produits</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Créer/Modifier */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-600" />
                {editModal.type === 'create' ? 'Nouvelle Flash Sale' : 'Modifier Flash Sale'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Méga Soldes de Février"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Description de la campagne..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date début *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date fin *</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Couleur de fond</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, bg_color: gradient.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.bg_color === gradient.value
                          ? 'border-emerald-500 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="h-8 rounded-md mb-1"
                        style={{ background: gradient.preview }}
                      />
                      <p className="text-xs text-gray-600 text-center">{gradient.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateOrUpdate}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
