import React, { useState, useEffect } from 'react'
import { Store, Plus, Edit2, Save, X, Loader2, MapPin, Phone, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { shopsService, Shop, CreateShopData } from '../lib/api/shopsService'
import { useToast } from '../components/Toast'
import { useAuthStore } from '../store/authStore'

const BAMAKO_COMMUNES = ['Commune I', 'Commune II', 'Commune III', 'Commune IV', 'Commune V', 'Commune VI', 'Kalaban-Coro', 'Autre']

export function VendorShopsPage() {
  const { showToast } = useToast()
  const { user } = useAuthStore()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  const [formData, setFormData] = useState<CreateShopData>({
    name: '', slug: '', description: '', logo_url: '', banner_url: '',
    address_commune: '', address_quartier: '', address_details: '', city: 'Bamako',
    phone: '', whatsapp: '', email: '', delivery_base_fee: 1000, delivery_available: true
  })

  useEffect(() => { loadMyShop() }, [user])

  const loadMyShop = async () => {
    try {
      setLoading(true)
      const response = await shopsService.getMyShop(user?.id?.toString())
      if (response.data) {
        setShop(response.data)
        setFormData({
          name: response.data.name || '', slug: response.data.slug || '',
          description: response.data.description || '',
          logo_url: response.data.logo_url || response.data.logo || '',
          banner_url: response.data.banner_url || response.data.banner || '',
          address_commune: response.data.address_commune || '',
          address_quartier: response.data.address_quartier || '',
          address_details: response.data.address_details || '',
          city: response.data.city || 'Bamako',
          phone: response.data.phone || '', whatsapp: response.data.whatsapp || '',
          email: response.data.email || '',
          delivery_base_fee: response.data.delivery_base_fee || 1000,
          delivery_available: response.data.delivery_available !== false
        })
      }
    } catch (err) { console.error('Erreur:', err) }
    finally { setLoading(false) }
  }

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleCreate = async () => {
    if (!formData.name.trim()) { showToast('Le nom est requis', 'error'); return }
    try {
      setSaving(true)
      const response = await shopsService.createShop(formData)
      if (response.data) { setShop(response.data); setIsCreating(false); showToast('Demande envoyée !', 'success'); loadMyShop() }
      else if (response.error) { showToast(response.error, 'error') }
    } catch (err: any) { showToast(err.message || 'Erreur', 'error') }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    if (!shop) return
    try {
      setSaving(true)
      const response = await shopsService.updateShop(shop.id, formData)
      if (response.data) { setShop(response.data); setIsEditing(false); showToast('Boutique mise à jour', 'success'); loadMyShop() }
      else if (response.error) { showToast(response.error, 'error') }
    } catch (err: any) { showToast(err.message || 'Erreur', 'error') }
    finally { setSaving(false) }
  }

  const getStatusBadge = () => {
    if (!shop) return null
    if (shop.status === 'pending' || !shop.is_active) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"><Clock size={14} />En attente</span>
    if (shop.status === 'approved' || shop.is_active) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"><CheckCircle size={14} />Approuvée</span>
    if (shop.status === 'rejected') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"><AlertCircle size={14} />Rejetée</span>
    return null
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>

  if (!shop && !isCreating) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"><Store className="w-12 h-12 text-emerald-600" /></div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Créez votre boutique</h1>
      <p className="text-gray-600 mb-8">Vous n'avez pas encore de boutique.</p>
      <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"><Plus size={20} />Créer ma boutique</button>
    </div>
  )

  const renderForm = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Nom *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value, slug: generateSlug(e.target.value)})} className="w-full px-4 py-3 border rounded-xl" placeholder="Ma Boutique" /></div>
        <div><label className="block text-sm font-medium mb-2">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-gray-50" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border rounded-xl" rows={3} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">URL Logo</label><input type="url" value={formData.logo_url || ''} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full px-4 py-3 border rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">URL Bannière</label><input type="url" value={formData.banner_url || ''} onChange={(e) => setFormData({...formData, banner_url: e.target.value})} className="w-full px-4 py-3 border rounded-xl" /></div>
      </div>
      <div className="border-t pt-4"><h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={18} />Adresse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={formData.address_commune} onChange={(e) => setFormData({...formData, address_commune: e.target.value})} className="px-4 py-3 border rounded-xl"><option value="">Commune...</option>{BAMAKO_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <input type="text" value={formData.address_quartier} onChange={(e) => setFormData({...formData, address_quartier: e.target.value})} className="px-4 py-3 border rounded-xl" placeholder="Quartier" />
          <input type="text" value={formData.address_details} onChange={(e) => setFormData({...formData, address_details: e.target.value})} className="px-4 py-3 border rounded-xl" placeholder="Détails" />
        </div>
      </div>
      <div className="border-t pt-4"><h3 className="font-semibold mb-4 flex items-center gap-2"><Phone size={18} />Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="px-4 py-3 border rounded-xl" placeholder="Téléphone" />
          <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="px-4 py-3 border rounded-xl" placeholder="WhatsApp" />
          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="px-4 py-3 border rounded-xl" placeholder="Email" />
        </div>
      </div>
      <div className="border-t pt-4"><h3 className="font-semibold mb-4 flex items-center gap-2"><Truck size={18} />Livraison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="number" value={formData.delivery_base_fee} onChange={(e) => setFormData({...formData, delivery_base_fee: parseInt(e.target.value) || 0})} className="px-4 py-3 border rounded-xl" placeholder="Frais (FCFA)" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.delivery_available} onChange={(e) => setFormData({...formData, delivery_available: e.target.checked})} className="w-5 h-5 rounded" />Livraison disponible</label>
        </div>
      </div>
    </div>
  )

  if (isCreating) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white"><h1 className="text-2xl font-bold flex items-center gap-3"><Store size={28} />Créer ma boutique</h1></div>
        {renderForm()}
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 bg-gray-100 rounded-xl">Annuler</button>
          <button onClick={handleCreate} disabled={saving} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin" />}Envoyer la demande</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white flex justify-between items-start">
          <div><h1 className="text-2xl font-bold flex items-center gap-3"><Store size={28} />{shop?.name}</h1><p className="text-emerald-100 mt-1">{shop?.description || 'Aucune description'}</p></div>
          <div className="flex flex-col items-end gap-2">{getStatusBadge()}{!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"><Edit2 size={16} />Modifier</button>}</div>
        </div>
        {isEditing ? (
          <>{renderForm()}<div className="p-6 border-t flex justify-end gap-3"><button onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-gray-100 rounded-xl flex items-center gap-2"><X size={16} />Annuler</button><button onClick={handleUpdate} disabled={saving} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl flex items-center gap-2">{saving && <Loader2 size={16} className="animate-spin" />}<Save size={16} />Enregistrer</button></div></>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500 text-sm">Commune</span><p className="font-medium">{shop?.address_commune || '-'}</p></div>
              <div><span className="text-gray-500 text-sm">Quartier</span><p className="font-medium">{shop?.address_quartier || '-'}</p></div>
              <div><span className="text-gray-500 text-sm">Téléphone</span><p className="font-medium">{shop?.phone || '-'}</p></div>
              <div><span className="text-gray-500 text-sm">WhatsApp</span><p className="font-medium">{shop?.whatsapp || '-'}</p></div>
              <div><span className="text-gray-500 text-sm">Email</span><p className="font-medium">{shop?.email || '-'}</p></div>
              <div><span className="text-gray-500 text-sm">Frais livraison</span><p className="font-medium">{shop?.delivery_base_fee || 0} FCFA</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
