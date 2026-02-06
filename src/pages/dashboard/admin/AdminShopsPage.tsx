import React, { useState, useEffect } from 'react'
import { 
  Search, Store, Edit2, Trash2, X, Eye, MapPin, Phone, Plus,
  CheckCircle, XCircle, Clock, AlertTriangle, Ban, Loader2, RefreshCw,
  LayoutGrid, List, Star, User, Mail, DollarSign
} from 'lucide-react'
import { shopsService, Shop } from '../../../lib/api/shopsService'
import { apiClient } from '../../../lib/api/apiClient'
import { usePermissions } from '../../../hooks/usePermissions'
import { useToast } from '../../../components/Toast'
import { useAuthStore } from '../../../stores/authStore'
import ShopFormModal, { ShopFormData } from '../../../components/admin/ShopFormModal'
import CommissionManagementModal from '../../../components/admin/CommissionManagementModal'

const AdminShopsPage: React.FC = () => {
  const { showToast } = useToast()
  const { 
    canViewShops, 
    canEditShops, 
    canDeleteShops, 
    canValidateShops 
  } = usePermissions()

  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null)
  const [viewingShop, setViewingShop] = useState<Shop | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [commissionShop, setCommissionShop] = useState<Shop | null>(null)
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false)

  const pageSize = 20

  // Stats
  const stats = {
    total: totalCount,
    pending: shops.filter(s => s.status === 'pending' || (!s.status && !s.is_active)).length,
    approved: shops.filter(s => s.status === 'approved' || (s.is_active && !s.status)).length,
    rejected: shops.filter(s => s.status === 'rejected').length,
    suspended: shops.filter(s => s.status === 'suspended').length,
  }

  // Filtered shops
  const filteredShops = shops.filter(shop => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return shop.status === 'pending' || (!shop.status && !shop.is_active)
    if (activeTab === 'approved') return shop.status === 'approved' || (shop.is_active && !shop.status)
    if (activeTab === 'rejected') return shop.status === 'rejected'
    if (activeTab === 'suspended') return shop.status === 'suspended'
    return true
  })

  useEffect(() => {
    loadShops()
  }, [currentPage, searchQuery])

  const loadShops = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await shopsService.getAllShopsAdmin({ page: currentPage, search: searchQuery })
      if (response.data) {
        if (Array.isArray(response.data)) {
          setShops(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setShops(response.data.results)
          setTotalCount(response.data.count)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des boutiques')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadShops()
  }

  const handleViewShop = (shop: Shop) => {
    setViewingShop(shop)
    setIsViewModalOpen(true)
  }

  const handleEditShop = (shop: Shop) => {
    if (!canEditShops()) return
    setEditingShop(shop)
    setIsEditModalOpen(true)
  }

  const handleCreateShop = () => {
    setEditingShop(null)
    setIsCreateModalOpen(true)
  }

  const uploadStoreImage = async (storeId: number, file: File, type: 'logo' | 'banner') => {
    const response = await apiClient.upload<{ success: boolean; data: { publicUrl: string } }>(
      `/api/upload/stores/${storeId}?type=${type}`,
      file,
      'image'
    )
    if (response.error) {
      console.error('Upload error:', response.error)
      return ''
    }
    return response.data?.data?.publicUrl || ''
  }

  const handleSaveShop = async (data: ShopFormData, logoFile?: File, bannerFile?: File) => {
    try {
      setActionLoading(true)
      
      if (editingShop) {
        // Update existing shop
        let updateData: any = { ...data }
        
        // Upload images if provided
        if (logoFile) {
          const logoUrl = await uploadStoreImage(editingShop.id, logoFile, 'logo')
          if (logoUrl) updateData.logo_url = logoUrl
        }
        if (bannerFile) {
          const bannerUrl = await uploadStoreImage(editingShop.id, bannerFile, 'banner')
          if (bannerUrl) updateData.banner_url = bannerUrl
        }
        
        await shopsService.updateShop(editingShop.id, updateData)
        showToast('Boutique mise à jour avec succès', 'success')
      } else {
        // Create new shop
        const response = await shopsService.createShop(data as any)
        const newShop = response.data
        
        // Upload images if provided
        if (newShop && (logoFile || bannerFile)) {
          if (logoFile) {
            const logoUrl = await uploadStoreImage(newShop.id, logoFile, 'logo')
            if (logoUrl) await shopsService.updateShop(newShop.id, { logo_url: logoUrl })
          }
          if (bannerFile) {
            const bannerUrl = await uploadStoreImage(newShop.id, bannerFile, 'banner')
            if (bannerUrl) await shopsService.updateShop(newShop.id, { banner_url: bannerUrl })
          }
        }
        showToast('Boutique créée avec succès', 'success')
      }
      
      setIsEditModalOpen(false)
      setIsCreateModalOpen(false)
      setEditingShop(null)
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'enregistrement', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (shop: Shop) => {
    if (!canDeleteShops()) return
    setShopToDelete(shop)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!shopToDelete || !canDeleteShops()) return
    try {
      setActionLoading(true)
      await shopsService.deleteShop(shopToDelete.id)
      setIsDeleteModalOpen(false)
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveShop = async (shop: Shop) => {
    if (!canValidateShops()) return
    try {
      setActionLoading(true)
      await shopsService.approveShop(shop.id)
      showToast(`Boutique "${shop.name}" approuvée`, 'success')
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'approbation', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectShop = async (shop: Shop) => {
    if (!canValidateShops()) return
    
    // Check if user is superadmin - reason is optional for superadmin, required for admin
    const { role } = useAuthStore.getState()
    const isSuperAdmin = role === 'super_admin'
    
    const reason = prompt(isSuperAdmin 
      ? 'Raison du rejet (optionnel pour SuperAdmin):' 
      : 'Raison du rejet (obligatoire):')
    
    if (reason === null) return // User cancelled
    
    // For admin, require a reason
    if (!isSuperAdmin && !reason.trim()) {
      showToast('La raison du rejet est obligatoire pour les admins', 'error')
      return
    }
    
    try {
      setActionLoading(true)
      await shopsService.rejectShop(shop.id, reason || '')
      showToast(`Boutique "${shop.name}" rejetée`, 'success')
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du rejet', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerifyShop = async (shop: Shop) => {
    if (!canValidateShops()) return
    try {
      setActionLoading(true)
      await shopsService.verifyShop(shop.id)
      showToast('Boutique vérifiée avec succès', 'success')
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la vérification', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnverifyShop = async (shop: Shop) => {
    if (!canValidateShops()) return
    try {
      setActionLoading(true)
      await shopsService.unverifyShop(shop.id)
      showToast('Vérification retirée', 'success')
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du retrait de la vérification', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusInfo = (shop: Shop) => {
    if (shop.status === 'rejected') return { icon: XCircle, label: 'Rejeté', bg: 'bg-red-100 text-red-700' }
    if (shop.status === 'suspended') return { icon: Ban, label: 'Suspendu', bg: 'bg-orange-100 text-orange-700' }
    if (shop.status === 'approved' || shop.is_active) return { icon: CheckCircle, label: 'Approuvé', bg: 'bg-green-100 text-green-700' }
    return { icon: Clock, label: 'En attente', bg: 'bg-yellow-100 text-yellow-700' }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  // No permission warning
  if (!canViewShops()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Ban className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-500">Vous n'avez pas la permission de voir les boutiques.</p>
        </div>
      </div>
    )
  }

  if (loading && shops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des boutiques...</p>
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
          <button onClick={loadShops} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            Gestion des Boutiques
          </h1>
          <p className="text-gray-500 mt-1">{totalCount} boutiques enregistrées</p>
        </div>
        {canEditShops() && (
          <button
            onClick={handleCreateShop}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
          >
            <Plus size={20} />
            Nouvelle boutique
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-blue-100 text-sm">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-yellow-100 text-sm">En attente</p>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-green-100 text-sm">Approuvées</p>
          <p className="text-2xl font-bold mt-1">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-red-100 text-sm">Rejetées</p>
          <p className="text-2xl font-bold mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-orange-100 text-sm">Suspendues</p>
          <p className="text-2xl font-bold mt-1">{stats.suspended}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab === 'all' ? 'Toutes' : tab === 'pending' ? 'En attente' : tab === 'approved' ? 'Approuvées' : tab === 'rejected' ? 'Rejetées' : 'Suspendues'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une boutique..."
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
            <button onClick={loadShops} className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">
              <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Shops Grid/List */}
      {filteredShops.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune boutique trouvée</h3>
          <p className="text-gray-500 mt-1">Modifiez vos filtres ou effectuez une nouvelle recherche</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShops.map((shop) => {
            const statusInfo = getStatusInfo(shop)
            return (
              <div key={shop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                  {shop.banner_url && (
                    <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg}`}>
                      <statusInfo.icon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {shop.logo_url ? (
                        <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
                      {shop.address_commune && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                          <MapPin size={12} />
                          {shop.address_commune}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewShop(shop)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="Voir">
                        <Eye size={16} />
                      </button>
                      {shop.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium" title="Boutique vérifiée">
                          <Star size={12} className="fill-yellow-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canValidateShops() && (shop.status === 'pending' || (!shop.status && !shop.is_active)) && (
                        <>
                          <button onClick={() => handleApproveShop(shop)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approuver">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleRejectShop(shop)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Rejeter">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {canValidateShops() && shop.is_active && (
                        <>
                          {!shop.is_verified ? (
                            <button 
                              onClick={() => handleVerifyShop(shop)} 
                              className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100" 
                              title="Vérifier la boutique"
                              disabled={actionLoading}
                            >
                              <Star size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUnverifyShop(shop)} 
                              className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" 
                              title="Retirer la vérification"
                              disabled={actionLoading}
                            >
                              <Star size={16} className="fill-yellow-500" />
                            </button>
                          )}
                        </>
                      )}
                      <button 
                        onClick={() => {
                          setCommissionShop(shop)
                          setIsCommissionModalOpen(true)
                        }} 
                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100" 
                        title="Gérer les commissions"
                      >
                        <DollarSign size={16} />
                      </button>
                      {canEditShops() && (
                        <button onClick={() => handleEditShop(shop)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Modifier">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {canDeleteShops() && (
                        <button onClick={() => handleDeleteClick(shop)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Boutique</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Localisation</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredShops.map((shop) => {
                const statusInfo = getStatusInfo(shop)
                return (
                  <tr key={shop.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                          {shop.logo_url ? (
                            <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{shop.name}</p>
                          <p className="text-sm text-gray-500">{shop.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {shop.address_commune || 'Non défini'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone size={14} />
                        {shop.phone || 'Non défini'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg}`}>
                        <statusInfo.icon size={12} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100">
                        <button onClick={() => handleViewShop(shop)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg" title="Voir">
                          <Eye size={18} />
                        </button>
                        {canEditShops() && (
                          <button onClick={() => handleEditShop(shop)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg" title="Modifier">
                            <Edit2 size={18} />
                          </button>
                        )}
                        {canDeleteShops() && (
                          <button onClick={() => handleDeleteClick(shop)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg" title="Supprimer">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 text-sm font-bold text-gray-900">Page {currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* View Modal - Enhanced */}
      {isViewModalOpen && viewingShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Banner Section */}
            <div className="relative h-48 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              {viewingShop.banner_url ? (
                <img src={viewingShop.banner_url} alt={viewingShop.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Store className="w-20 h-20 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
              {canEditShops() && (
                <button 
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditShop(viewingShop)
                  }}
                  className="absolute top-4 right-16 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  title="Modifier"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Logo & Title Section */}
              <div className="p-6 -mt-16 relative z-10">
                <div className="flex items-end gap-4 mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden border-4 border-white">
                    {viewingShop.logo_url ? (
                      <img src={viewingShop.logo_url} alt={viewingShop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-bold text-gray-900">{viewingShop.name}</h2>
                      {viewingShop.is_verified && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                          <Star size={14} className="fill-yellow-500" />
                          Vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mb-2">@{viewingShop.slug}</p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const statusInfo = getStatusInfo(viewingShop)
                        return (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${statusInfo.bg}`}>
                            <statusInfo.icon size={14} />
                            {statusInfo.label}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewingShop.description && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{viewingShop.description}</p>
                  </div>
                )}

                {/* Owner Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={20} className="text-emerald-600" />
                    Propriétaire de la boutique
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-sm text-gray-600 mb-1">Nom</p>
                      <p className="font-semibold text-gray-900">{(viewingShop as any).owner_name || 'Non défini'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Mail size={14} />
                        Email
                      </p>
                      <p className="font-semibold text-gray-900 truncate">{(viewingShop as any).owner_email || 'Non défini'}</p>
                    </div>
                  </div>
                </div>

                {/* Shop Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Store size={20} className="text-emerald-600" />
                    Informations de la boutique
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Phone size={14} />
                        Téléphone
                      </p>
                      <p className="font-semibold text-gray-900">{viewingShop.phone || 'Non défini'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Mail size={14} />
                        Email boutique
                      </p>
                      <p className="font-semibold text-gray-900">{viewingShop.email || 'Non défini'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Commune
                      </p>
                      <p className="font-semibold text-gray-900">{viewingShop.address_commune || 'Non défini'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Quartier
                      </p>
                      <p className="font-semibold text-gray-900">{viewingShop.address_quartier || 'Non défini'}</p>
                    </div>
                  </div>
                  {viewingShop.address_details && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Adresse complète</p>
                      <p className="font-semibold text-gray-900">{viewingShop.address_details}</p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border border-purple-100">
                    <p className="text-2xl font-bold text-purple-600">{viewingShop.products_count || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Produits</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl text-center border border-orange-100">
                    <p className="text-2xl font-bold text-orange-600">{viewingShop.rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-sm text-gray-600 mt-1">Note moyenne</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center border border-green-100">
                    <p className="text-2xl font-bold text-green-600">{viewingShop.delivery_available ? 'Oui' : 'Non'}</p>
                    <p className="text-sm text-gray-600 mt-1">Livraison</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Fermer
              </button>
              <div className="flex items-center gap-3">
                {canValidateShops() && viewingShop.is_active && (
                  <>
                    {!viewingShop.is_verified ? (
                      <button 
                        onClick={() => handleVerifyShop(viewingShop)} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium"
                        disabled={actionLoading}
                      >
                        <Star size={18} />
                        Vérifier la boutique
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUnverifyShop(viewingShop)} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                        disabled={actionLoading}
                      >
                        <Star size={18} className="fill-yellow-500" />
                        Retirer vérification
                      </button>
                    )}
                  </>
                )}
                {canEditShops() && (
                  <button 
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleEditShop(viewingShop)
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Edit2 size={18} />
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <ShopFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingShop(null); }}
        onSave={handleSaveShop}
        initialData={editingShop ? {
          name: editingShop.name,
          slug: editingShop.slug,
          description: editingShop.description || '',
          logo_url: editingShop.logo_url || '',
          banner_url: editingShop.banner_url || '',
          address_commune: editingShop.address_commune || '',
          address_quartier: editingShop.address_quartier || '',
          address_details: editingShop.address_details || '',
          city: editingShop.city || 'Bamako',
          phone: editingShop.phone || '',
          whatsapp: editingShop.whatsapp || '',
          email: editingShop.email || '',
          delivery_base_fee: editingShop.delivery_base_fee || 1000,
          delivery_available: editingShop.delivery_available ?? true,
          is_active: editingShop.is_active ?? true
        } : undefined}
        isLoading={actionLoading}
        title="Modifier la boutique"
      />

      {/* Create Modal */}
      <ShopFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveShop}
        isLoading={actionLoading}
        title="Nouvelle boutique"
      />

      {/* Commission Management Modal */}
      {isCommissionModalOpen && commissionShop && (
        <CommissionManagementModal
          storeId={commissionShop.id}
          storeName={commissionShop.name}
          defaultCommissionRate={commissionShop.default_commission_rate || 10}
          defaultCommissionType={commissionShop.commission_type || 'percentage'}
          onClose={() => {
            setIsCommissionModalOpen(false)
            setCommissionShop(null)
          }}
          onUpdate={loadShops}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && shopToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer la boutique</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{shopToDelete.name}</strong> ? Cette action est irréversible.
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

export default AdminShopsPage
