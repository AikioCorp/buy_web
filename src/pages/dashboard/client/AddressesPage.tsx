import React, { useState } from 'react'
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react'
import { useAddresses } from '../../../hooks/useAddresses'
import type { CreateAddressData } from '../../../lib/api/addressesService'

// Données des communes et quartiers de Bamako
const BAMAKO_ZONES: Record<string, string[]> = {
  'Commune I': ['Korofina Nord', 'Korofina Sud', 'Banconi', 'Boulkassoumbougou', 'Djelibougou', 'Sotuba', 'Fadjiguila', 'Sikoroni', 'Doumanzana'],
  'Commune II': ['Hippodrome', 'Médina Coura', 'Bozola', 'Niarela', 'Quinzambougou', 'Bagadadji', 'TSF', 'Missira', 'Zone Industrielle', 'Bougouba'],
  'Commune III': ['Bamako Coura', 'Darsalam', 'Ouolofobougou', 'ACI 2000', 'Point G', 'Koulouba', 'N\'Tomikorobougou', 'Samé', 'Badialan I', 'Badialan II', 'Badialan III'],
  'Commune IV': ['Lafiabougou', 'Hamdallaye', 'Djicoroni Para', 'Sébenikoro', 'Taliko', 'Lassa', 'Sébénikoro', 'Djélibougou'],
  'Commune V': ['Badalabougou', 'Quartier du Fleuve', 'Torokorobougou', 'Daoudabougou', 'Sabalibougou', 'Kalaban Coura', 'Baco Djicoroni ACI', 'Baco Djicoroni Golf', 'Garantiguibougou'],
  'Commune VI': ['Sogoniko', 'Faladié', 'Magnambougou', 'Niamakoro', 'Banankabougou', 'Missabougou', 'Sokorodji', 'Yirimadio', 'Dianéguéla', 'Senou']
}

const AddressesPage: React.FC = () => {
  const { addresses, isLoading, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateAddressData>({
    label: 'Domicile',
    full_name: '',
    phone: '',
    email: '',
    commune: '',
    quartier: '',
    address_details: '',
    street: '',
    city: 'Bamako',
    country: 'Mali',
    is_default: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      await updateAddress(editingId, formData)
    } else {
      await createAddress(formData)
    }
    
    setShowForm(false)
    setEditingId(null)
    resetForm()
  }

  const handleEdit = (address: any) => {
    setFormData({
      label: address.label || 'Domicile',
      full_name: address.full_name,
      phone: address.phone,
      email: address.email || '',
      commune: address.commune,
      quartier: address.quartier,
      address_details: address.address_details || '',
      street: address.street || '',
      city: address.city || 'Bamako',
      country: address.country,
      is_default: address.is_default,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      await deleteAddress(id)
    }
  }

  const handleSetDefault = async (id: number) => {
    await setDefaultAddress(id)
  }

  const resetForm = () => {
    setFormData({
      label: 'Domicile',
      full_name: '',
      phone: '',
      email: '',
      commune: '',
      quartier: '',
      address_details: '',
      street: '',
      city: 'Bamako',
      country: 'Mali',
      is_default: false,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-green-600" />
            Mes adresses
          </h1>
          <p className="text-gray-600 mt-1">Gérez vos adresses de livraison</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            resetForm()
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvelle adresse
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libellé *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Maison, Bureau, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="+223 XX XX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commune *
                </label>
                <select
                  required
                  value={formData.commune}
                  onChange={(e) => {
                    setFormData({ ...formData, commune: e.target.value, quartier: '' })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez une commune</option>
                  {Object.keys(BAMAKO_ZONES).map((commune) => (
                    <option key={commune} value={commune}>
                      {commune}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartier *
                </label>
                <select
                  required
                  value={formData.quartier}
                  onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!formData.commune}
                >
                  <option value="">Sélectionnez un quartier</option>
                  {formData.commune && BAMAKO_ZONES[formData.commune]?.map((quartier) => (
                    <option key={quartier} value={quartier}>
                      {quartier}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Détails de l'adresse
              </label>
              <textarea
                value={formData.address_details}
                onChange={(e) => setFormData({ ...formData, address_details: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Numéro de porte, bâtiment, étage, etc."
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Définir comme adresse par défaut
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  resetForm()
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune adresse</h3>
          <p className="text-gray-600 mb-6">
            Ajoutez une adresse de livraison pour faciliter vos commandes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg shadow p-4 relative ${
                address.is_default ? 'border-2 border-green-500' : ''
              }`}
            >
              {address.is_default && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} />
                  Par défaut
                </div>
              )}

              <h3 className="font-bold text-lg mb-2">{address.label}</h3>
              <p className="text-gray-700 font-medium">{address.full_name}</p>
              <p className="text-gray-600 text-sm">{address.phone}</p>
              <p className="text-gray-600 text-sm mt-2">
                {address.commune}, {address.quartier}
              </p>
              {address.address_details && (
                <p className="text-gray-600 text-sm">{address.address_details}</p>
              )}
              <p className="text-gray-600 text-sm">{address.city}, {address.country}</p>

              <div className="flex gap-2 mt-4">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleEdit(address)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AddressesPage
