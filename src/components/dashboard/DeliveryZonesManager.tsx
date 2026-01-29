import { useState, useEffect } from 'react'
import { 
  Truck, Plus, Trash2, Edit2, Save, X, MapPin, Clock, 
  DollarSign, CheckCircle 
} from 'lucide-react'
import { BAMAKO_COMMUNES, DEFAULT_DELIVERY_CONFIG } from '@/lib/api/deliveryService'
import { formatPrice } from '@/lib/utils'

interface DeliveryZone {
  id?: number
  commune: string
  delivery_fee: number
  estimated_time: string
  is_active: boolean
}

interface DeliveryZonesManagerProps {
  storeId: number
  initialZones?: DeliveryZone[]
  onZonesChange?: (zones: DeliveryZone[]) => void
}

export function DeliveryZonesManager({ 
  initialZones = [], 
  onZonesChange 
}: DeliveryZonesManagerProps) {
  const [zones, setZones] = useState<DeliveryZone[]>(initialZones)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newZone, setNewZone] = useState<DeliveryZone>({
    commune: '',
    delivery_fee: 1000,
    estimated_time: 'Sous 24h',
    is_active: true
  })

  useEffect(() => {
    if (initialZones.length > 0) {
      setZones(initialZones)
    }
  }, [initialZones])

  // Communes disponibles (non encore configurées)
  const availableCommunes = Object.keys(BAMAKO_COMMUNES).filter(
    commune => !zones.some(z => z.commune === commune)
  )

  const handleAddZone = () => {
    if (!newZone.commune) return

    const updatedZones = [...zones, { ...newZone, id: Date.now() }]
    setZones(updatedZones)
    onZonesChange?.(updatedZones)
    
    setNewZone({
      commune: '',
      delivery_fee: 1000,
      estimated_time: 'Sous 24h',
      is_active: true
    })
    setIsAdding(false)
  }

  const handleUpdateZone = (updatedZone: DeliveryZone) => {
    const updatedZones = zones.map(z => 
      z.id === updatedZone.id ? updatedZone : z
    )
    setZones(updatedZones)
    onZonesChange?.(updatedZones)
    setEditingZone(null)
  }

  const handleDeleteZone = (zoneId: number) => {
    const updatedZones = zones.filter(z => z.id !== zoneId)
    setZones(updatedZones)
    onZonesChange?.(updatedZones)
  }

  const handleToggleActive = (zoneId: number) => {
    const updatedZones = zones.map(z => 
      z.id === zoneId ? { ...z, is_active: !z.is_active } : z
    )
    setZones(updatedZones)
    onZonesChange?.(updatedZones)
  }

  const applyDefaultConfig = () => {
    const defaultZones: DeliveryZone[] = Object.keys(BAMAKO_COMMUNES).map((commune, index) => ({
      id: Date.now() + index,
      commune,
      delivery_fee: DEFAULT_DELIVERY_CONFIG.zone_fees[commune] || 1000,
      estimated_time: DEFAULT_DELIVERY_CONFIG.estimated_times[commune] || 'Sous 24h',
      is_active: true
    }))
    setZones(defaultZones)
    onZonesChange?.(defaultZones)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#0f4c2b]" />
            <h3 className="font-semibold text-gray-900">Zones de livraison</h3>
          </div>
          {zones.length === 0 && (
            <button
              onClick={applyDefaultConfig}
              className="text-sm text-[#0f4c2b] hover:underline"
            >
              Appliquer la configuration par défaut
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Configurez les frais et délais de livraison pour chaque commune de Bamako
        </p>
      </div>

      {/* Liste des zones configurées */}
      <div className="divide-y divide-gray-100">
        {zones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>Aucune zone de livraison configurée</p>
            <p className="text-sm mt-1">Ajoutez des zones ou appliquez la configuration par défaut</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div 
              key={zone.id} 
              className={`p-4 ${!zone.is_active ? 'bg-gray-50 opacity-60' : ''}`}
            >
              {editingZone?.id === zone.id ? (
                // Mode édition
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Frais de livraison (FCFA)
                      </label>
                      <input
                        type="number"
                        value={editingZone?.delivery_fee || 0}
                        onChange={(e) => setEditingZone(editingZone ? {
                          ...editingZone,
                          delivery_fee: parseInt(e.target.value) || 0
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Délai estimé
                      </label>
                      <select
                        value={editingZone?.estimated_time || 'Sous 24h'}
                        onChange={(e) => setEditingZone(editingZone ? {
                          ...editingZone,
                          estimated_time: e.target.value
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="Sous 24h">Sous 24h</option>
                        <option value="24-48h">24-48h</option>
                        <option value="2-3 jours">2-3 jours</option>
                        <option value="3-5 jours">3-5 jours</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingZone(null)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => editingZone && handleUpdateZone(editingZone)}
                      className="px-3 py-1.5 text-sm bg-[#0f4c2b] text-white rounded-lg hover:bg-[#0d3d23]"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Mode affichage
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{zone.commune}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatPrice(zone.delivery_fee, 'XOF')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {zone.estimated_time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(zone.id!)}
                      className={`p-1.5 rounded-lg ${
                        zone.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={zone.is_active ? 'Désactiver' : 'Activer'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingZone(zone)}
                      className="p-1.5 text-gray-400 hover:text-[#0f4c2b] hover:bg-gray-100 rounded-lg"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id!)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout */}
      {isAdding ? (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Commune
                </label>
                <select
                  value={newZone.commune}
                  onChange={(e) => setNewZone({ ...newZone, commune: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="">Sélectionner...</option>
                  {availableCommunes.map((commune) => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Frais (FCFA)
                </label>
                <input
                  type="number"
                  value={newZone.delivery_fee}
                  onChange={(e) => setNewZone({
                    ...newZone,
                    delivery_fee: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Délai
                </label>
                <select
                  value={newZone.estimated_time}
                  onChange={(e) => setNewZone({
                    ...newZone,
                    estimated_time: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="Sous 24h">Sous 24h</option>
                  <option value="24-48h">24-48h</option>
                  <option value="2-3 jours">2-3 jours</option>
                  <option value="3-5 jours">3-5 jours</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleAddZone}
                disabled={!newZone.commune}
                className="px-4 py-2 text-sm bg-[#0f4c2b] text-white rounded-lg hover:bg-[#0d3d23] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      ) : (
        availableCommunes.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#0f4c2b] border border-dashed border-[#0f4c2b] rounded-lg hover:bg-green-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter une zone de livraison
            </button>
          </div>
        )
      )}

      {/* Info si toutes les communes sont configurées */}
      {availableCommunes.length === 0 && zones.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Toutes les communes de Bamako sont configurées</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryZonesManager
