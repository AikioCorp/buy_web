import React, { useState, useEffect } from 'react'
import { 
  Store, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  Loader2, RefreshCw, MapPin, Phone, Mail, Calendar, User, X, FileText
} from 'lucide-react'
import { shopsService, Shop } from '../../../lib/api/shopsService'
import { useToast } from '../../../components/Toast'
import { usePermissions } from '../../../hooks/usePermissions'

const SuperAdminShopRequestsPage: React.FC = () => {
  const { showToast } = useToast()
  const {
    canViewShops,
    canValidateShops,
    isSuperAdmin
  } = usePermissions()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadShopRequests()
  }, [])

  const loadShopRequests = async () => {
    try {
      setLoading(true)
      // Use getAllShopsAdmin to get all shops including inactive ones
      const response = await shopsService.getAllShopsAdmin({ page: 1 })
      if (response.data) {
        let allShops: Shop[] = []
        if (Array.isArray(response.data)) {
          allShops = response.data
        } else if (response.data.results) {
          allShops = response.data.results
        }
        // Filter only pending shops (not active OR status is pending)
        const pendingShops = allShops.filter(s => 
          s.status === 'pending' || (!s.is_active && s.status !== 'rejected' && s.status !== 'suspended')
        )
        setShops(pendingShops)
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (shop: Shop) => {
    try {
      setActionLoading(true)
      await shopsService.approveShop(shop.id)
      showToast(`Boutique "${shop.name}" approuvée!`, 'success')
      loadShopRequests()
      setIsViewModalOpen(false)
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'approbation', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (shop: Shop) => {
    const reason = prompt('Raison du rejet (optionnel pour SuperAdmin):')
    if (reason === null) return // User cancelled
    
    try {
      setActionLoading(true)
      await shopsService.rejectShop(shop.id, reason || '')
      showToast(`Boutique "${shop.name}" rejetée`, 'success')
      loadShopRequests()
      setIsViewModalOpen(false)
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du rejet', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shop as any).owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Demandes de Boutiques</h1>
              <p className="text-white/80 mt-1">Approuvez ou rejetez les nouvelles boutiques</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
              <Clock size={18} />
              <span className="font-medium">{shops.length} demandes en attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
            />
          </div>
          <button 
            onClick={loadShopRequests}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Shop Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune demande en attente</h3>
          <p className="text-gray-500">Toutes les demandes de boutiques ont été traitées.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
              {/* Shop Image */}
              <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 relative">
                {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-16 h-16 text-emerald-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                    <Clock size={14} />
                    En attente
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{shop.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{shop.description || 'Aucune description'}</p>
                
                {/* Owner Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {(shop as any).owner_name && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span>{(shop as any).owner_name}</span>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  {(shop as any).address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate">{(shop as any).address}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(shop)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(shop)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                  <button
                    onClick={() => { setSelectedShop(shop); setIsViewModalOpen(true) }}
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header with image */}
            <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-500 relative">
              {selectedShop.logo ? (
                <img src={selectedShop.logo} alt={selectedShop.name} className="w-full h-full object-cover opacity-30" />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                    {selectedShop.logo ? (
                      <img src={selectedShop.logo} alt={selectedShop.name} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <Store className="w-10 h-10" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">{selectedShop.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700">{selectedShop.description || 'Aucune description fournie'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(selectedShop as any).owner_name && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <User size={14} />
                        <span className="text-sm font-medium">Propriétaire</span>
                      </div>
                      <p className="text-gray-900 font-medium">{(selectedShop as any).owner_name}</p>
                    </div>
                  )}
                  
                  {(selectedShop as any).owner_email && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Mail size={14} />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-gray-900 font-medium">{(selectedShop as any).owner_email}</p>
                    </div>
                  )}
                  
                  {selectedShop.phone && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Phone size={14} />
                        <span className="text-sm font-medium">Téléphone</span>
                      </div>
                      <p className="text-gray-900 font-medium">{selectedShop.phone}</p>
                    </div>
                  )}
                  
                  {(selectedShop as any).address && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <MapPin size={14} />
                        <span className="text-sm font-medium">Adresse</span>
                      </div>
                      <p className="text-gray-900 font-medium">{(selectedShop as any).address}</p>
                    </div>
                  )}
                </div>

                {(selectedShop as any).documents && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <FileText size={14} />
                      Documents fournis
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-600 text-sm">Documents disponibles pour vérification</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Fermer
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReject(selectedShop)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Rejeter
                </button>
                <button
                  onClick={() => handleApprove(selectedShop)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approuver la boutique
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminShopRequestsPage
