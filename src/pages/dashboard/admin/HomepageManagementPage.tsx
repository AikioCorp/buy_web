import React, { useState, useEffect, useRef } from 'react'
import { Image, Plus, Trash2, Edit2, Loader2, Eye, EyeOff, LayoutGrid, Tag, Sparkles, Search, X, Save, Upload, Palette } from 'lucide-react'
import { homepageService, HeroSlider, PromoBanner, FeaturedProduct } from '../../../lib/api/homepageService'
import { productsService, Product } from '../../../lib/api/productsService'
import { useToast } from '../../../components/Toast'

// Couleurs prédéfinies (gradients Tailwind)
const PRESET_GRADIENTS = [
  { value: 'from-purple-600 to-pink-600', label: 'Violet → Rose', colors: ['#9333ea', '#db2777'] },
  { value: 'from-red-600 to-orange-500', label: 'Rouge → Orange', colors: ['#dc2626', '#f97316'] },
  { value: 'from-green-600 to-emerald-500', label: 'Vert → Émeraude', colors: ['#16a34a', '#10b981'] },
  { value: 'from-blue-600 to-indigo-700', label: 'Bleu → Indigo', colors: ['#2563eb', '#4338ca'] },
  { value: 'from-orange-500 to-red-600', label: 'Orange → Rouge', colors: ['#f97316', '#dc2626'] },
  { value: 'from-cyan-500 to-blue-600', label: 'Cyan → Bleu', colors: ['#06b6d4', '#2563eb'] },
  { value: 'from-yellow-500 to-orange-500', label: 'Jaune → Orange', colors: ['#eab308', '#f97316'] },
  { value: 'from-pink-500 to-rose-600', label: 'Rose → Rose foncé', colors: ['#ec4899', '#e11d48'] },
  { value: 'from-teal-500 to-green-600', label: 'Teal → Vert', colors: ['#14b8a6', '#16a34a'] },
  { value: 'from-indigo-500 to-purple-600', label: 'Indigo → Violet', colors: ['#6366f1', '#9333ea'] },
]

// Couleurs solides prédéfinies
const PRESET_COLORS = [
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a',
  '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5',
  '#7c3aed', '#9333ea', '#c026d3', '#db2777', '#e11d48', '#1f2937',
]

export default function HomepageManagementPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<'sliders' | 'banners' | 'featured'>('sliders')
  const [loading, setLoading] = useState(true)
  const [sliders, setSliders] = useState<HeroSlider[]>([])
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [featured, setFeatured] = useState<FeaturedProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [section, setSection] = useState<'top_ventes' | 'flash_deals' | 'populaires'>('top_ventes')
  const [uploading, setUploading] = useState(false)
  const [colorMode, setColorMode] = useState<'preset' | 'custom'>('preset')
  const [customColor1, setCustomColor1] = useState('#9333ea')
  const [customColor2, setCustomColor2] = useState('#db2777')
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: number; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async (force = false) => {
    // Cache simple: ne recharge que si force=true ou si les données sont vides
    if (!force && sliders.length > 0 && banners.length > 0 && products.length > 0) {
      return
    }
    
    setLoading(true)
    try {
      const [s, b, f, p] = await Promise.all([
        homepageService.getSliders(true),
        homepageService.getBanners(true),
        homepageService.getFeaturedProducts(undefined, true),
        productsService.getProducts({ page: 1, page_size: 1000, light: true }) // Charge léger pour la recherche
      ])
      if (s.data) setSliders(s.data)
      if (b.data) setBanners(b.data)
      if (f.data) setFeatured(f.data)
      if (p.data) {
        const productList = Array.isArray(p.data) ? p.data : (p.data as any).results || []
        console.log('Produits chargés pour recherche:', productList.length)
        setProducts(productList)
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
      showToast('Erreur lors du chargement des données', 'error')
    }
    setLoading(false)
  }

  const saveSlider = async (data: any) => {
    try {
      // Filtrer les champs internes avant envoi
      const { _type, ...cleanData } = data
      if (cleanData.id) await homepageService.updateSlider(cleanData.id, cleanData)
      else await homepageService.createSlider(cleanData)
      setEditItem(null); loadData(true); showToast('Slider sauvegardé', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la sauvegarde', 'error')
    }
  }

  const saveBanner = async (data: any) => {
    try {
      // Filtrer les champs internes avant envoi
      const { _type, ...cleanData } = data
      if (cleanData.id) await homepageService.updateBanner(cleanData.id, cleanData)
      else await homepageService.createBanner(cleanData)
      setEditItem(null); loadData(true); showToast('Bannière sauvegardée', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    
    try {
      if (confirmDelete.type === 'slider') {
        await homepageService.deleteSlider(confirmDelete.id)
        setSliders(prev => prev.filter(s => s.id !== confirmDelete.id))
        showToast('Slider supprimé', 'success')
      } else if (confirmDelete.type === 'banner') {
        await homepageService.deleteBanner(confirmDelete.id)
        setBanners(prev => prev.filter(b => b.id !== confirmDelete.id))
        showToast('Bannière supprimée', 'success')
      }
      setConfirmDelete(null)
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la suppression', 'error')
    }
  }

  // Upload d'image (silencieux, sans rechargement de page)
  const handleImageUpload = async (file: File) => {
    if (!editItem || !editItem.id) {
      showToast('Sauvegardez d\'abord l\'élément avant d\'uploader une image', 'warning')
      return
    }
    
    setUploading(true)
    try {
      let imageUrl = ''
      if (editItem._type === 'slider') {
        const res = await homepageService.uploadSliderImage(editItem.id, file)
        if (res.error) {
          showToast(res.error, 'error')
          setUploading(false)
          return
        }
        if (res.data) {
          imageUrl = res.data.image_url
        }
      } else {
        const res = await homepageService.uploadBannerImage(editItem.id, file)
        if (res.error) {
          showToast(res.error, 'error')
          setUploading(false)
          return
        }
        if (res.data) {
          imageUrl = res.data.image_url
        }
      }
      
      if (imageUrl) {
        // Mise à jour silencieuse de l'état local uniquement
        setEditItem((prev: any) => ({ ...prev, image_url: imageUrl }))
        
        // Mise à jour silencieuse de la liste sans fermer le modal
        if (editItem._type === 'slider') {
          setSliders(prev => prev.map(s => s.id === editItem.id ? { ...s, image_url: imageUrl } : s))
        } else {
          setBanners(prev => prev.map(b => b.id === editItem.id ? { ...b, image_url: imageUrl } : b))
        }
        
        showToast('Image uploadée avec succès', 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Erreur upload', 'error')
    }
    setUploading(false)
  }

  // Générer le gradient CSS personnalisé (stocké comme string pour style inline)
  const generateCustomGradient = () => {
    return `linear-gradient(to right, ${customColor1}, ${customColor2})`
  }

  const applyCustomGradient = () => {
    const gradient = generateCustomGradient()
    setEditItem({ ...editItem, bg_color: gradient })
  }

  const addFeatured = async (productId: number) => {
    try {
      // Vérifier si le produit n'est pas déjà dans cette section
      const alreadyExists = featured.some(f => f.product_id === productId && f.section === section)
      if (alreadyExists) {
        showToast('Ce produit est déjà dans cette section', 'warning')
        return
      }
      
      await homepageService.addFeaturedProduct(productId, section)
      loadData(true)
      showToast('Produit ajouté', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de l\'ajout', 'error')
    }
  }

  const removeFeatured = async (id: number) => {
    try {
      await homepageService.removeFeaturedProduct(id)
      // Mise à jour locale immédiate
      setFeatured(prev => prev.filter(f => f.id !== id))
      showToast('Produit retiré', 'success')
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la suppression', 'error')
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <LayoutGrid className="w-8 h-8 text-emerald-600" />
        Gestion Page d'Accueil
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'sliders', icon: Image, label: `Sliders (${sliders.length})` },
          { key: 'banners', icon: Tag, label: `Bannières (${banners.length})` },
          { key: 'featured', icon: Sparkles, label: `Produits Vedettes (${featured.length})` }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${tab === t.key ? 'bg-white text-emerald-600 shadow' : 'text-gray-600'}`}>
            <t.icon size={18} />{t.label}
          </button>
        ))}
      </div>

      {/* SLIDERS */}
      {tab === 'sliders' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Sliders du Carousel</h2>
            <button onClick={() => setEditItem({ title: '', subtitle: '', bg_color: 'from-purple-600 to-pink-600', image_url: '', cta_text: 'Découvrir', cta_link: '/shops', position: sliders.length + 1, is_active: true, _type: 'slider' })}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Plus size={18} />Ajouter
            </button>
          </div>
          {sliders.map(s => (
            <div key={s.id} className={`bg-white rounded-xl border p-4 flex gap-4 ${!s.is_active ? 'opacity-50' : ''}`}>
              <img src={s.image_url} className="w-40 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.subtitle}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${s.bg_color}`}>{s.cta_text}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  await homepageService.updateSlider(s.id!, { is_active: !s.is_active })
                  setSliders(prev => prev.map(sl => sl.id === s.id ? { ...sl, is_active: !sl.is_active } : sl))
                }} className="p-2 rounded bg-gray-100">{s.is_active ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                <button onClick={() => setEditItem({ ...s, _type: 'slider' })} className="p-2 rounded bg-blue-100 text-blue-600"><Edit2 size={18} /></button>
                <button onClick={() => setConfirmDelete({ type: 'slider', id: s.id!, name: s.title })} className="p-2 rounded bg-red-100 text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BANNERS */}
      {tab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Bannières Promo (3 recommandées)</h2>
            <button onClick={() => setEditItem({ title: '', subtitle: '', discount: '-20%', bg_color: 'from-blue-600 to-indigo-700', image_url: '', link: '/', position: banners.length + 1, is_active: true, _type: 'banner' })}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Plus size={18} />Ajouter
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {banners.map(b => (
              <div key={b.id} className={`bg-white rounded-xl border overflow-hidden ${!b.is_active ? 'opacity-50' : ''}`}>
                <img src={b.image_url} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{b.title}</h3>
                      <p className="text-sm text-gray-600">{b.subtitle}</p>
                      {b.discount && <span className="text-red-600 font-bold">{b.discount}</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={async () => {
                      await homepageService.updateBanner(b.id!, { is_active: !b.is_active })
                      setBanners(prev => prev.map(bn => bn.id === b.id ? { ...bn, is_active: !bn.is_active } : bn))
                    }} className="p-1.5 rounded bg-gray-100">{b.is_active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                      <button onClick={() => setEditItem({ ...b, _type: 'banner' })} className="p-1.5 rounded bg-blue-100 text-blue-600"><Edit2 size={16} /></button>
                      <button onClick={() => setConfirmDelete({ type: 'banner', id: b.id!, name: b.title })} className="p-1.5 rounded bg-red-100 text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURED PRODUCTS */}
      {tab === 'featured' && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {['top_ventes', 'flash_deals', 'populaires'].map(s => (
              <button key={s} onClick={() => setSection(s as any)}
                className={`px-4 py-2 rounded-lg ${section === s ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                {s === 'top_ventes' ? 'Top Ventes' : s === 'flash_deals' ? 'Flash Deals' : 'Populaires'}
              </button>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Featured */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Produits actuels ({featured.filter(f => f.section === section).length})
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {featured.filter(f => f.section === section).length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun produit dans cette section</p>
                    </div>
                  ) : (
                    featured.filter(f => f.section === section).map(f => {
                      const product = f.product
                      const imageUrl = product?.media?.[0]?.image_url || product?.images?.[0]?.image_url
                      
                      return (
                        <div key={f.id} className="group relative flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all">
                          {/* Image produit */}
                          {imageUrl ? (
                            <img src={imageUrl} alt={product?.name} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Info produit */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{product?.name || `Produit #${f.product_id}`}</h4>
                            <p className="text-sm text-emerald-600 font-medium">{product?.base_price ? `${product.base_price} FCFA` : 'Prix non défini'}</p>
                          </div>
                          
                          {/* Bouton supprimer */}
                          <button 
                            onClick={() => removeFeatured(f.id!)} 
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            title="Retirer"
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

            {/* Add Products */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Ajouter un produit
                </h3>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Rechercher par nom..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2 max-h-[440px] overflow-y-auto">
                  {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && !featured.some(f => f.product_id === p.id && f.section === section)).slice(0, 30).map(p => {
                    const imageUrl = p.media?.[0]?.image_url || p.images?.[0]?.image_url
                    
                    return (
                      <div 
                        key={p.id} 
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all group"
                        onClick={() => addFeatured(p.id)}
                      >
                        {/* Image produit */}
                        {imageUrl ? (
                          <img src={imageUrl} alt={p.name} className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Info produit */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">{p.name}</h4>
                          <p className="text-xs text-emerald-600 font-semibold">{p.base_price} FCFA</p>
                        </div>
                        
                        {/* Icône ajouter */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={20} className="text-emerald-600" />
                        </div>
                      </div>
                    )
                  })}
                  
                  {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && !featured.some(f => f.product_id === p.id && f.section === section)).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun produit trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editItem.id ? 'Modifier' : 'Créer'} {editItem._type === 'slider' ? 'Slider' : 'Bannière'}</h2>
                <button onClick={() => setEditItem(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Titre</label>
                  <input value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Sous-titre</label>
                  <input value={editItem.subtitle} onChange={e => setEditItem({ ...editItem, subtitle: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                {editItem._type === 'slider' && (
                  <div><label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={editItem.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={2} /></div>
                )}
                {editItem._type === 'banner' && (
                  <div><label className="block text-sm font-medium mb-1">Réduction</label>
                    <input value={editItem.discount || ''} onChange={e => setEditItem({ ...editItem, discount: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="-30%" /></div>
                )}
                {/* Image Upload / URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  {editItem.image_url && (
                    <div className="mb-3">
                      {/* Prévisualisation avec positionnement */}
                      <div className="relative w-full h-32 rounded-lg border overflow-hidden bg-gray-100">
                        <img 
                          src={editItem.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          style={{ objectPosition: editItem.image_position || 'center center' }}
                        />
                      </div>
                      
                      {/* Sélecteur de position d'image */}
                      <div className="mt-2">
                        <label className="block text-xs text-gray-500 mb-1">Position de l'image :</label>
                        <div className="grid grid-cols-3 gap-1 w-32">
                          {[
                            { pos: 'top left', icon: '↖' },
                            { pos: 'top center', icon: '↑' },
                            { pos: 'top right', icon: '↗' },
                            { pos: 'center left', icon: '←' },
                            { pos: 'center center', icon: '•' },
                            { pos: 'center right', icon: '→' },
                            { pos: 'bottom left', icon: '↙' },
                            { pos: 'bottom center', icon: '↓' },
                            { pos: 'bottom right', icon: '↘' },
                          ].map(({ pos, icon }) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setEditItem({ ...editItem, image_position: pos })}
                              className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                                (editItem.image_position || 'center center') === pos 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || !editItem.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      {editItem.id ? 'Uploader une image' : 'Sauvegarder d\'abord'}
                    </button>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">Ou coller une URL :</label>
                    <input value={editItem.image_url || ''} onChange={e => setEditItem({ ...editItem, image_url: e.target.value })} 
                      className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="https://..." />
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Palette size={16} />
                    Couleur de fond
                  </label>
                  
                  {/* Mode selector */}
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setColorMode('preset')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${colorMode === 'preset' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                      Prédéfinies
                    </button>
                    <button type="button" onClick={() => setColorMode('custom')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${colorMode === 'custom' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                      Personnalisée
                    </button>
                  </div>

                  {colorMode === 'preset' ? (
                    <>
                      {/* Preset Gradients */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {PRESET_GRADIENTS.map(g => (
                          <button key={g.value} type="button"
                            onClick={() => setEditItem({ ...editItem, bg_color: g.value })}
                            className={`p-2 rounded-lg border-2 transition-all ${editItem.bg_color === g.value ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent'}`}>
                            <div className={`h-6 rounded bg-gradient-to-r ${g.value}`}></div>
                            <span className="text-xs text-gray-600 mt-1 block">{g.label}</span>
                          </button>
                        ))}
                      </div>
                      {/* Solid Colors */}
                      <label className="block text-xs text-gray-500 mb-1">Couleurs unies :</label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map(color => (
                          <button key={color} type="button"
                            onClick={() => setEditItem({ ...editItem, bg_color: `from-[${color}] to-[${color}]` })}
                            className="w-7 h-7 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Couleur 1</label>
                          <div className="flex gap-2">
                            <input type="color" value={customColor1} onChange={e => setCustomColor1(e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                            <input type="text" value={customColor1} onChange={e => setCustomColor1(e.target.value)}
                              className="flex-1 px-2 py-1 border rounded-lg text-sm font-mono" placeholder="#000000" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Couleur 2</label>
                          <div className="flex gap-2">
                            <input type="color" value={customColor2} onChange={e => setCustomColor2(e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                            <input type="text" value={customColor2} onChange={e => setCustomColor2(e.target.value)}
                              className="flex-1 px-2 py-1 border rounded-lg text-sm font-mono" placeholder="#000000" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-8 rounded-lg" style={{ background: `linear-gradient(to right, ${customColor1}, ${customColor2})` }}></div>
                        <button type="button" onClick={applyCustomGradient}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                          Appliquer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Current color preview */}
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">Couleur actuelle :</span>
                    <div className={`h-6 rounded mt-1 bg-gradient-to-r ${editItem.bg_color}`}></div>
                    <span className="text-xs text-gray-400 font-mono">{editItem.bg_color}</span>
                  </div>
                </div>
                <div><label className="block text-sm font-medium mb-1">{editItem._type === 'slider' ? 'Texte bouton' : 'Lien'}</label>
                  <input value={editItem._type === 'slider' ? editItem.cta_text : editItem.link || ''} onChange={e => setEditItem({ ...editItem, [editItem._type === 'slider' ? 'cta_text' : 'link']: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                {editItem._type === 'slider' && (
                  <div><label className="block text-sm font-medium mb-1">Lien du bouton</label>
                    <input value={editItem.cta_link} onChange={e => setEditItem({ ...editItem, cta_link: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditItem(null)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                <button onClick={() => editItem._type === 'slider' ? saveSlider(editItem) : saveBanner(editItem)} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2">
                  <Save size={18} />Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
