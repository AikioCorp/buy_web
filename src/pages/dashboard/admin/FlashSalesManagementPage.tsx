import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Loader2, Clock, Calendar, Zap, Search, X, Save, Image as ImageIcon, Percent, DollarSign, Store, Globe, Hand, ChevronRight } from 'lucide-react'
import { flashSalesService, FlashSale, FlashSaleProduct } from '../../../lib/api/flashSalesService'
import { productsService, Product } from '../../../lib/api/productsService'
import { shopsService, Shop } from '../../../lib/api/shopsService'
import { useToast } from '../../../components/Toast'

export default function FlashSalesManagementPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [selectedSale, setSelectedSale] = useState<FlashSale | null>(null)
  const [saleProducts, setSaleProducts] = useState<FlashSaleProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [search, setSearch] = useState('')
  const [shopSearch, setShopSearch] = useState('')
  const [editModal, setEditModal] = useState<{ type: 'create' | 'edit'; sale?: FlashSale } | null>(null)
  const [formData, setFormData] = useState<Partial<FlashSale>>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    bg_color: 'from-red-500 to-orange-500',
    product_source_type: 'manual',
    source_store_id: null,
    display_order: 0,
    show_countdown: true,
    custom_padding: null,
    custom_margin: null
  })
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [customColorValue, setCustomColorValue] = useState('#ef4444')

  // Couleurs prédéfinies : gradients + couleurs unies
  const PRESET_COLORS = [
    // Gradients
    { value: 'from-red-500 to-orange-500', label: 'Rouge → Orange', preview: 'linear-gradient(to right, #ef4444, #f97316)', type: 'gradient' },
    { value: 'from-purple-600 to-pink-600', label: 'Violet → Rose', preview: 'linear-gradient(to right, #9333ea, #db2777)', type: 'gradient' },
    { value: 'from-blue-600 to-indigo-700', label: 'Bleu → Indigo', preview: 'linear-gradient(to right, #2563eb, #4338ca)', type: 'gradient' },
    { value: 'from-green-600 to-emerald-500', label: 'Vert → Émeraude', preview: 'linear-gradient(to right, #16a34a, #10b981)', type: 'gradient' },
    { value: 'from-orange-500 to-red-600', label: 'Orange → Rouge', preview: 'linear-gradient(to right, #f97316, #dc2626)', type: 'gradient' },
    { value: 'from-cyan-500 to-blue-600', label: 'Cyan → Bleu', preview: 'linear-gradient(to right, #06b6d4, #2563eb)', type: 'gradient' },
    // Couleurs unies
    { value: 'bg-red-500', label: 'Rouge', preview: '#ef4444', type: 'solid' },
    { value: 'bg-orange-500', label: 'Orange', preview: '#f97316', type: 'solid' },
    { value: 'bg-yellow-500', label: 'Jaune', preview: '#eab308', type: 'solid' },
    { value: 'bg-green-500', label: 'Vert', preview: '#22c55e', type: 'solid' },
    { value: 'bg-blue-500', label: 'Bleu', preview: '#3b82f6', type: 'solid' },
    { value: 'bg-purple-500', label: 'Violet', preview: '#a855f7', type: 'solid' },
    { value: 'bg-pink-500', label: 'Rose', preview: '#ec4899', type: 'solid' },
    { value: 'bg-gray-800', label: 'Noir', preview: '#1f2937', type: 'solid' },
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
      const [salesRes, productsRes, shopsRes] = await Promise.all([
        flashSalesService.getFlashSales(true),
        productsService.getProducts({ page: 1, page_size: 1000, light: true }),
        shopsService.getAllShopsAdmin({ page: 1 })
      ])
      
      if (salesRes.data) setFlashSales(salesRes.data)
      if (productsRes.data) {
        const productList = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data as any).results || []
        setProducts(productList)
      }
      if (shopsRes.data) {
        const shopList = Array.isArray(shopsRes.data) ? shopsRes.data : (shopsRes.data as any).results || []
        setShops(shopList)
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

      if (formData.product_source_type === 'store' && !formData.source_store_id) {
        showToast('Veuillez sélectionner une boutique', 'error')
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
      setFormData({ title: '', description: '', start_date: '', end_date: '', is_active: true, bg_color: 'from-red-500 to-orange-500', product_source_type: 'manual', source_store_id: null, display_order: 0, show_countdown: true, custom_padding: null, custom_margin: null })
      setUseCustomColor(false)
      setCustomColorValue('#ef4444')
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
    setFormData({ title: '', description: '', start_date: '', end_date: '', is_active: true, bg_color: 'from-red-500 to-orange-500', product_source_type: 'manual', source_store_id: null, display_order: flashSales.length, show_countdown: true, custom_padding: null, custom_margin: null })
    setShopSearch('')
    setUseCustomColor(false)
    setCustomColorValue('#ef4444')
    setEditModal({ type: 'create' })
  }

  const openEditModal = (sale: FlashSale) => {
    const bgColor = sale.bg_color || 'from-red-500 to-orange-500'
    const isCustom = bgColor.startsWith('custom:')
    setFormData({
      title: sale.title,
      description: sale.description,
      start_date: sale.start_date.slice(0, 16),
      end_date: sale.end_date.slice(0, 16),
      is_active: sale.is_active,
      bg_color: bgColor,
      product_source_type: sale.product_source_type || 'manual',
      source_store_id: sale.source_store_id || null,
      display_order: sale.display_order ?? 0,
      show_countdown: sale.show_countdown !== false,
      custom_padding: sale.custom_padding || null,
      custom_margin: sale.custom_margin || null
    })
    setShopSearch('')
    setUseCustomColor(isCustom)
    setCustomColorValue(isCustom ? bgColor.replace('custom:', '') : '#ef4444')
    setEditModal({ type: 'edit', sale })
  }

  const getSourceLabel = (type?: string) => {
    switch (type) {
      case 'all_promo': return 'Tous les produits en promo'
      case 'store': return 'Produits d\'une boutique'
      default: return 'Sélection manuelle'
    }
  }

  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'all_promo': return <Globe className="w-4 h-4" />
      case 'store': return <Store className="w-4 h-4" />
      default: return <Hand className="w-4 h-4" />
    }
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
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                      {sale.display_order ?? 0}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{sale.title}</h3>
                      {sale.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sale.description}</p>
                      )}
                    </div>
                  </div>
                  {isActive(sale) && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  {getSourceIcon(sale.product_source_type)}
                  <span>{getSourceLabel(sale.product_source_type)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
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
          <div className="lg:col-span-2">
            {/* Info banner for auto source types */}
            {selectedSale.product_source_type && selectedSale.product_source_type !== 'manual' && (
              <div className="mb-4 p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50">
                <div className="flex items-center gap-3">
                  {getSourceIcon(selectedSale.product_source_type)}
                  <div>
                    <h4 className="font-semibold text-blue-900">{getSourceLabel(selectedSale.product_source_type)}</h4>
                    <p className="text-sm text-blue-700">
                      {selectedSale.product_source_type === 'all_promo' 
                        ? 'Les produits en promotion sur toute la plateforme seront automatiquement affichés dans cette Flash Sale.'
                        : `Les produits de la boutique sélectionnée seront automatiquement affichés.`
                      }
                    </p>
                    {selectedSale.product_source_type === 'store' && selectedSale.source_store_id && (
                      <p className="text-xs text-blue-600 mt-1">
                        Boutique ID: {selectedSale.source_store_id} — {shops.find(s => s.id === selectedSale.source_store_id)?.name || ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manual mode: show product management */}
            {(!selectedSale.product_source_type || selectedSale.product_source_type === 'manual') && (
              <div className="grid md:grid-cols-2 gap-6">
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
            )}
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-600" />
                {editModal.type === 'create' ? 'Nouvelle Flash Sale' : 'Modifier Flash Sale'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
                  rows={2}
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

              {/* Source des produits */}
              <div>
                <label className="block text-sm font-medium mb-2">Source des produits</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'manual', label: 'Manuel', desc: 'Choisir un par un', icon: <Hand className="w-5 h-5" /> },
                    { value: 'all_promo', label: 'Promos', desc: 'Tous en promo', icon: <Globe className="w-5 h-5" /> },
                    { value: 'store', label: 'Boutique', desc: 'Une boutique', icon: <Store className="w-5 h-5" /> },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, product_source_type: opt.value as any, source_store_id: opt.value !== 'store' ? null : formData.source_store_id })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        formData.product_source_type === opt.value
                          ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`mx-auto mb-1 ${formData.product_source_type === opt.value ? 'text-emerald-600' : 'text-gray-400'}`}>{opt.icon}</div>
                      <p className={`text-sm font-semibold ${formData.product_source_type === opt.value ? 'text-emerald-700' : 'text-gray-700'}`}>{opt.label}</p>
                      <p className="text-[10px] text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Store selector (only when source is 'store') */}
              {formData.product_source_type === 'store' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Sélectionner une boutique</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={shopSearch}
                      onChange={e => setShopSearch(e.target.value)}
                      placeholder="Rechercher une boutique..."
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-1">
                    {shops
                      .filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase()))
                      .slice(0, 20)
                      .map(shop => (
                        <button
                          key={shop.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, source_store_id: shop.id })}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                            formData.source_store_id === shop.id
                              ? 'bg-emerald-50 border border-emerald-300'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {shop.logo || shop.logo_url ? (
                            <img src={shop.logo || shop.logo_url || ''} alt={shop.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Store className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{shop.name}</p>
                            {shop.city && <p className="text-[10px] text-gray-500">{shop.city}</p>}
                          </div>
                          {formData.source_store_id === shop.id && (
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    {shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())).length === 0 && (
                      <p className="text-center text-gray-400 text-xs py-4">Aucune boutique trouvée</p>
                    )}
                  </div>
                </div>
              )}

              {/* Couleur de fond */}
              <div>
                <label className="block text-sm font-medium mb-2">Couleur de fond</label>
                <div className="space-y-3">
                  {/* Couleurs prédéfinies */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => {
                          setUseCustomColor(false)
                          setFormData({ ...formData, bg_color: color.value })
                        }}
                        className={`p-1 rounded-lg border-2 transition-all ${
                          !useCustomColor && formData.bg_color === color.value
                            ? 'border-emerald-500 ring-2 ring-emerald-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={color.label}
                      >
                        <div
                          className="h-6 rounded"
                          style={{ background: color.preview }}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Couleur personnalisée */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use_custom_color"
                      checked={useCustomColor}
                      onChange={e => {
                        setUseCustomColor(e.target.checked)
                        if (e.target.checked) {
                          setFormData({ ...formData, bg_color: `custom:${customColorValue}` })
                        }
                      }}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="use_custom_color" className="text-sm">Couleur personnalisée</label>
                    {useCustomColor && (
                      <div className="flex items-center gap-2 ml-2">
                        <input
                          type="color"
                          value={customColorValue}
                          onChange={e => {
                            setCustomColorValue(e.target.value)
                            setFormData({ ...formData, bg_color: `custom:${e.target.value}` })
                          }}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={customColorValue}
                          onChange={e => {
                            setCustomColorValue(e.target.value)
                            setFormData({ ...formData, bg_color: `custom:${e.target.value}` })
                          }}
                          className="w-24 px-2 py-1 text-xs border rounded"
                          placeholder="#ff0000"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options d'affichage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ordre d'affichage</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order ?? 0}
                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Plus petit = plus haut</p>
                </div>
                <div className="space-y-2 pt-1">
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show_countdown"
                      checked={formData.show_countdown !== false}
                      onChange={e => setFormData({ ...formData, show_countdown: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="show_countdown" className="text-sm font-medium">Afficher countdown</label>
                  </div>
                </div>
              </div>

              {/* Padding & Margin personnalisés */}
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">📐 Espacement personnalisé</span>
                  <span className="text-gray-400">(optionnel)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Padding (espace intérieur)</label>
                    <input
                      type="text"
                      value={formData.custom_padding || ''}
                      onChange={e => setFormData({ ...formData, custom_padding: e.target.value || null })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="40px 20px"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Espace entre le bord et le contenu</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Margin (espace extérieur)</label>
                    <input
                      type="text"
                      value={formData.custom_margin || ''}
                      onChange={e => setFormData({ ...formData, custom_margin: e.target.value || null })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="20px 0"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Espace autour de la section</p>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 bg-white p-2 rounded border">
                  <p className="font-medium mb-1">💡 Exemples de valeurs :</p>
                  <ul className="space-y-0.5">
                    <li><code className="bg-gray-100 px-1 rounded">20px</code> = 20 pixels (tous les côtés)</li>
                    <li><code className="bg-gray-100 px-1 rounded">20px 40px</code> = 20px haut/bas, 40px gauche/droite</li>
                    <li><code className="bg-gray-100 px-1 rounded">2rem</code> = 2× la taille de police (~32px)</li>
                    <li><code className="bg-gray-100 px-1 rounded">0</code> = aucun espacement</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
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
