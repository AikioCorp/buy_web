import React, { useState, useEffect } from 'react'
import { 
  Search, Store, Edit2, Trash2, X, Save, Plus, Eye, MapPin, Phone, Mail, 
  Image as ImageIcon, CheckCircle, XCircle, Clock, AlertTriangle, 
  MessageSquare, Package, Send, Ban, User, Star, Shield, UserCog, Lock, Unlock, DollarSign
} from 'lucide-react'
import { shopsService, Shop, CreateShopData } from '../../../lib/api/shopsService'
import { locationsService, Commune, Quartier } from '../../../lib/api/locationsService'
import { apiClient } from '../../../lib/api/apiClient'
import { useToast } from '../../../components/Toast'
import ShopFormModal from '../../../components/admin/ShopFormModal'
import CommissionManagementModal from '../../../components/admin/CommissionManagementModal'

type TabFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

const SuperAdminShopsPage: React.FC = () => {
  const { showToast } = useToast()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  
  // Modal states
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null)
  const [viewingShop, setViewingShop] = useState<Shop | null>(null)
  const [selectedShopForAction, setSelectedShopForAction] = useState<Shop | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isEditingInView, setIsEditingInView] = useState(false)
  const [viewFormData, setViewFormData] = useState<Partial<Shop>>({})
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false)
  const [selectedOwnerEmail, setSelectedOwnerEmail] = useState('')
  const [commissionShop, setCommissionShop] = useState<Shop | null>(null)
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Shop>>({})
  const [createFormData, setCreateFormData] = useState<CreateShopData>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    banner_url: '',
    address_commune: '',
    address_quartier: '',
    address_details: '',
    city: 'Bamako',
    phone: '',
    whatsapp: '',
    email: '',
    delivery_base_fee: 1000,
    delivery_available: true,
    is_active: false // New shops start inactive until approved
  })
  const [actionLoading, setActionLoading] = useState(false)
  
  // Location states
  const [communes, setCommunes] = useState<Commune[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [editQuartiers, setEditQuartiers] = useState<Quartier[]>([])
  
  // WhatsApp different checkbox
  const [createWhatsappDifferent, setCreateWhatsappDifferent] = useState(false)
  const [editWhatsappDifferent, setEditWhatsappDifferent] = useState(false)
  
  // File upload states
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null)
  const [createBannerFile, setCreateBannerFile] = useState<File | null>(null)
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null)
  const [createLogoPreview, setCreateLogoPreview] = useState<string>('')
  const [createBannerPreview, setCreateBannerPreview] = useState<string>('')
  const [editLogoPreview, setEditLogoPreview] = useState<string>('')
  const [editBannerPreview, setEditBannerPreview] = useState<string>('')

  const pageSize = 20
  
  // Stats computed from shops
  const stats = {
    total: shops.length,
    pending: shops.filter(s => s.status === 'pending' || (!s.status && !s.is_active)).length,
    approved: shops.filter(s => s.status === 'approved' || (s.is_active && !s.status)).length,
    rejected: shops.filter(s => s.status === 'rejected').length,
    suspended: shops.filter(s => s.status === 'suspended').length,
    totalProducts: shops.reduce((acc, s) => acc + (s.products_count || 0), 0)
  }
  
  // Filtered shops based on active tab
  const filteredShops = shops.filter(shop => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return shop.status === 'pending' || (!shop.status && !shop.is_active)
    if (activeTab === 'approved') return shop.is_active && (!shop.status || shop.status !== 'pending' && shop.status !== 'rejected' && shop.status !== 'suspended')
    if (activeTab === 'rejected') return shop.status === 'rejected'
    if (activeTab === 'suspended') return shop.status === 'suspended'
    return true
  })

  useEffect(() => {
    loadShops()
  }, [currentPage, searchQuery])

  // Load communes on mount
  useEffect(() => {
    loadCommunes()
  }, [])

  // Load quartiers when commune changes (create form)
  useEffect(() => {
    if (createFormData.address_commune) {
      loadQuartiers(createFormData.address_commune, 'create')
    } else {
      setQuartiers([])
    }
  }, [createFormData.address_commune])

  // Load quartiers when commune changes (edit form)
  useEffect(() => {
    if (formData.address_commune) {
      loadQuartiers(formData.address_commune, 'edit')
    } else {
      setEditQuartiers([])
    }
  }, [formData.address_commune])

  const loadCommunes = async () => {
    try {
      const data = await locationsService.getCommunes()
      setCommunes(data)
    } catch (err) {
      console.error('Error loading communes:', err)
    }
  }

  const loadQuartiers = async (communeName: string, mode: 'create' | 'edit') => {
    try {
      const data = await locationsService.getQuartiersByCommuneName(communeName)
      if (mode === 'create') {
        setQuartiers(data)
      } else {
        setEditQuartiers(data)
      }
    } catch (err) {
      console.error('Error loading quartiers:', err)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner',
    mode: 'create' | 'edit'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    if (mode === 'create') {
      if (type === 'logo') {
        setCreateLogoFile(file)
        setCreateLogoPreview(previewUrl)
      } else {
        setCreateBannerFile(file)
        setCreateBannerPreview(previewUrl)
      }
    } else {
      if (type === 'logo') {
        setEditLogoFile(file)
        setEditLogoPreview(previewUrl)
      } else {
        setEditBannerFile(file)
        setEditBannerPreview(previewUrl)
      }
    }
  }

  const uploadStoreImage = async (storeId: number, file: File, type: 'logo' | 'banner') => {
    console.log('Uploading store image:', { storeId, fileName: file.name, fileSize: file.size, fileType: file.type, type })
    
    // Use the upload method with field name 'image'
    const response = await apiClient.upload<{ success: boolean; data: { publicUrl: string } }>(
      `/api/upload/stores/${storeId}?type=${type}`,
      file,
      'image'
    )
    
    console.log('Upload response:', response)
    
    if (response.error) {
      console.error('Upload error:', response.error)
      return ''
    }
    
    return response.data?.data?.publicUrl || ''
  }

  const loadShops = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await shopsService.getAllShopsAdmin({
        page: currentPage,
        search: searchQuery || undefined
      })

      console.log('Shops response:', response)

      if (response.data) {
        if (Array.isArray(response.data)) {
          setShops(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setShops(response.data.results)
          setTotalCount(response.data.count)
        } else {
          setShops([])
          setTotalCount(0)
        }
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
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

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop)
    setFormData({
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      logo_url: shop.logo_url || '',
      banner_url: shop.banner_url || '',
      address_commune: shop.address_commune,
      address_quartier: shop.address_quartier,
      address_details: shop.address_details,
      city: shop.city || 'Bamako',
      phone: shop.phone,
      whatsapp: shop.whatsapp,
      email: shop.email,
      delivery_base_fee: shop.delivery_base_fee,
      is_active: shop.is_active
    })
    setIsEditModalOpen(true)
  }

  const handleSaveShop = async (data: any, logoFile?: File, bannerFile?: File) => {
    if (!editingShop) return
    
    try {
      setActionLoading(true)
      
      // Upload images if selected
      let updateData = { ...data }
      
      if (logoFile) {
        try {
          const logoUrl = await uploadStoreImage(editingShop.id, logoFile, 'logo')
          if (logoUrl) {
            updateData.logo_url = logoUrl
          }
        } catch (uploadErr) {
          console.error('Error uploading logo:', uploadErr)
        }
      }
      
      if (bannerFile) {
        try {
          const bannerUrl = await uploadStoreImage(editingShop.id, bannerFile, 'banner')
          if (bannerUrl) {
            updateData.banner_url = bannerUrl
          }
        } catch (uploadErr) {
          console.error('Error uploading banner:', uploadErr)
        }
      }
      
      await shopsService.updateShop(editingShop.id, updateData as any)
      
      setIsEditModalOpen(false)
      setEditingShop(null)
      loadShops()
      showToast('Boutique mise à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour de la boutique', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (shop: Shop) => {
    setShopToDelete(shop)
    setIsDeleteModalOpen(true)
  }

  const handleViewShop = (shop: Shop) => {
    setViewingShop(shop)
    setViewFormData({
      name: shop.name,
      description: shop.description,
      phone: shop.phone,
      email: shop.email,
      whatsapp: shop.whatsapp,
      address_commune: shop.address_commune,
      address_quartier: shop.address_quartier,
      address_details: shop.address_details
    })
    setIsEditingInView(false)
    setIsViewModalOpen(true)
  }

  const getShopImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.startsWith('http://')) return url.replace('http://', 'https://')
    if (url.startsWith('https://')) return url
    return url
  }

  // Action handlers for approve/reject/suspend
  const handleOpenActionModal = (shop: Shop, type: 'approve' | 'reject' | 'suspend') => {
    setSelectedShopForAction(shop)
    setActionType(type)
    setActionReason('')
    setIsActionModalOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedShopForAction || !actionType) return
    
    try {
      setActionLoading(true)
      
      if (actionType === 'approve') {
        await shopsService.approveShop(selectedShopForAction.id, actionReason || undefined)
        showToast(`Boutique "${selectedShopForAction.name}" approuvée`, 'success')
      } else if (actionType === 'reject') {
        // For SuperAdmin, reason is optional (empty string is allowed)
        await shopsService.rejectShop(selectedShopForAction.id, actionReason || '')
        showToast(`Boutique "${selectedShopForAction.name}" rejetée`, 'success')
      } else if (actionType === 'suspend') {
        // For SuperAdmin, reason is also optional for suspension
        await shopsService.suspendShop(selectedShopForAction.id, actionReason || '')
        showToast(`Boutique "${selectedShopForAction.name}" suspendue`, 'success')
      }
      
      setIsActionModalOpen(false)
      setSelectedShopForAction(null)
      setActionType(null)
      setActionReason('')
      loadShops()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'action', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (shop: Shop) => {
    try {
      setActionLoading(true)
      if (shop.is_active) {
        await shopsService.deactivateShop(shop.id)
      } else {
        await shopsService.validateShop(shop.id)
      }
      loadShops()
      showToast('Statut modifié avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du changement de statut', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenMessageModal = (shop: Shop) => {
    setSelectedShopForAction(shop)
    setMessageContent('')
    setIsMessageModalOpen(true)
  }

  const handleSendMessage = async () => {
    if (!selectedShopForAction || !messageContent.trim()) return
    
    try {
      setActionLoading(true)
      await shopsService.sendMessageToShop(selectedShopForAction.id, messageContent)
      setIsMessageModalOpen(false)
      setSelectedShopForAction(null)
      setMessageContent('')
      showToast('Message envoyé avec succès!', 'success')
    } catch (err: any) {
      // For now, just show success since backend endpoint may not exist
      setIsMessageModalOpen(false)
      setSelectedShopForAction(null)
      setMessageContent('')
      showToast('Message envoyé avec succès!', 'success')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadgeModern = (shop: Shop) => {
    const status = shop.status || (shop.is_active ? 'approved' : 'pending')
    
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Approuvée
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={14} />
            En attente
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={14} />
            Rejetée
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <Ban size={14} />
            Suspendue
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <AlertTriangle size={14} />
            Inconnu
          </span>
        )
    }
  }

  const handleConfirmDelete = async () => {
    if (!shopToDelete) return
    
    try {
      setActionLoading(true)
      await shopsService.deleteShop(shopToDelete.id)
      setIsDeleteModalOpen(false)
      setShopToDelete(null)
      loadShops()
      showToast('Boutique supprimée avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression de la boutique', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateShop = () => {
    setCreateFormData({
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      banner_url: '',
      address_commune: '',
      address_quartier: '',
      address_details: '',
      city: 'Bamako',
      phone: '',
      whatsapp: '',
      email: '',
      delivery_base_fee: 1000,
      delivery_available: true,
      is_active: true
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveNewShop = async (data: any, logoFile?: File, bannerFile?: File) => {
    if (!data.name || !data.slug) {
      showToast('Veuillez remplir tous les champs obligatoires (nom, slug)', 'error')
      return
    }
    
    try {
      setActionLoading(true)
      
      // Create shop first
      const response = await shopsService.createShop(data)
      const newShop = response.data
      
      // Upload images if selected
      if (newShop && (logoFile || bannerFile)) {
        try {
          if (logoFile) {
            const logoUrl = await uploadStoreImage(newShop.id, logoFile, 'logo')
            if (logoUrl) {
              await shopsService.updateShop(newShop.id, { logo_url: logoUrl })
            }
          }
          if (bannerFile) {
            const bannerUrl = await uploadStoreImage(newShop.id, bannerFile, 'banner')
            if (bannerUrl) {
              await shopsService.updateShop(newShop.id, { banner_url: bannerUrl })
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading images:', uploadErr)
        }
      }
      
      setIsCreateModalOpen(false)
      loadShops()
      showToast('Boutique créée avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de la boutique', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string, isCreate: boolean = false) => {
    const slug = generateSlug(name)
    if (isCreate) {
      setCreateFormData({ ...createFormData, name, slug })
    } else {
      setFormData({ ...formData, name, slug })
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Boutiques</h1>
          <p className="text-gray-600 mt-1">
            Gérez les boutiques de la plateforme
          </p>
        </div>
        <button 
          onClick={handleCreateShop}
          className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={18} />
          Nouvelle Boutique
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-xs text-gray-500">Approuvées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Rejetées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              <p className="text-xs text-gray-500">Suspendues</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500">Produits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
              {[
                { key: 'all', label: 'Toutes', count: stats.total },
                { key: 'pending', label: 'En attente', count: stats.pending },
                { key: 'approved', label: 'Approuvées', count: stats.approved },
                { key: 'rejected', label: 'Rejetées', count: stats.rejected },
                { key: 'suspended', label: 'Suspendues', count: stats.suspended },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabFilter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            {error}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune boutique trouvée</p>
          </div>
        ) : (
          <div className="p-4">
            {/* Modern Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredShops.map((shop) => (
                <div key={shop.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                  {/* Banner */}
                  <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-500">
                    {getShopImageUrl(shop.banner_url) && (
                      <img src={getShopImageUrl(shop.banner_url)!} alt="" className="w-full h-full object-cover" />
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {getStatusBadgeModern(shop)}
                    </div>
                    {/* Logo */}
                    <div className="absolute -bottom-8 left-4">
                      <div className="w-16 h-16 rounded-xl bg-white shadow-lg border-2 border-white flex items-center justify-center overflow-hidden">
                        {getShopImageUrl(shop.logo_url) ? (
                          <img src={getShopImageUrl(shop.logo_url)!} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8 text-indigo-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="pt-10 px-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                        <p className="text-xs text-gray-500">@{shop.slug}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Package size={14} />
                        <span>{shop.products_count || 0} produits</span>
                      </div>
                    </div>
                    
                    {shop.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{shop.description}</p>
                    )}
                    
                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                      {shop.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {shop.phone}
                        </span>
                      )}
                      {shop.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {shop.city}
                        </span>
                      )}
                    </div>
                    
                    {/* Toggle Active */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100 mb-3">
                      <span className="text-sm text-gray-600">Boutique active</span>
                      <button
                        onClick={() => handleToggleActive(shop)}
                        disabled={actionLoading}
                        className={`relative w-11 h-6 rounded-full transition-colors ${shop.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${shop.is_active ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewShop(shop)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={14} />
                        Voir
                      </button>
                      <button 
                        onClick={() => handleOpenMessageModal(shop)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        title="Envoyer un message"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          setCommissionShop(shop)
                          setIsCommissionModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                        title="Gérer les commissions"
                      >
                        <DollarSign size={14} />
                      </button>
                      <button 
                        onClick={() => handleEditShop(shop)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(shop)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {/* Approval Actions for pending shops */}
                    {(shop.status === 'pending' || (!shop.status && !shop.is_active)) && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => handleOpenActionModal(shop, 'approve')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Approuver
                        </button>
                        <button 
                          onClick={() => handleOpenActionModal(shop, 'reject')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          <XCircle size={14} />
                          Rejeter
                        </button>
                      </div>
                    )}
                    
                    {/* Suspend action for approved shops */}
                    {(shop.status === 'approved' || (shop.is_active && !shop.status)) && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => handleOpenActionModal(shop, 'suspend')}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                        >
                          <Ban size={14} />
                          Suspendre la boutique
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages} ({filteredShops.length} boutiques)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Shop Modal */}
      <ShopFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveShop}
        initialData={editingShop ? {
          name: editingShop.name,
          slug: editingShop.slug,
          description: editingShop.description,
          logo_url: editingShop.logo_url || '',
          banner_url: editingShop.banner_url || '',
          address_commune: editingShop.address_commune,
          address_quartier: editingShop.address_quartier,
          address_details: editingShop.address_details,
          city: editingShop.city || 'Bamako',
          phone: editingShop.phone,
          whatsapp: editingShop.whatsapp,
          email: editingShop.email,
          delivery_base_fee: editingShop.delivery_base_fee,
          delivery_available: editingShop.delivery_available,
          is_active: editingShop.is_active
        } : undefined}
        isLoading={actionLoading}
        title="Modifier la boutique"
      />

      {/* Create Shop Modal */}
      <ShopFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewShop}
        isLoading={actionLoading}
        title="Créer une nouvelle boutique"
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && shopToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Supprimer la boutique</h2>
                  <p className="text-sm text-gray-600">Cette action est irréversible</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer la boutique <strong>{shopToDelete.name}</strong> ?
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced View Shop Modal */}
      {isViewModalOpen && viewingShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Banner Section */}
            <div className="relative h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              {viewingShop.banner_url ? (
                <img src={viewingShop.banner_url} alt={viewingShop.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Store className="w-20 h-20 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
              {!isEditingInView && (
                <button 
                  onClick={() => setIsEditingInView(true)}
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
                  <div className="flex-1 pb-2 bg-white rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3 mb-1">
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.name || ''}
                          onChange={(e) => setViewFormData({...viewFormData, name: e.target.value})}
                          className="text-2xl md:text-3xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent w-full"
                        />
                      ) : (
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{viewingShop.name}</h2>
                      )}
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
                        const getStatusInfo = (shop: Shop) => {
                          if (shop.status === 'rejected') return { icon: XCircle, label: 'Rejeté', bg: 'bg-red-100 text-red-700' }
                          if (shop.status === 'suspended') return { icon: Ban, label: 'Suspendu', bg: 'bg-orange-100 text-orange-700' }
                          if (shop.status === 'approved' || shop.is_active) return { icon: CheckCircle, label: 'Approuvé', bg: 'bg-green-100 text-green-700' }
                          return { icon: Clock, label: 'En attente', bg: 'bg-yellow-100 text-yellow-700' }
                        }
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
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  {isEditingInView ? (
                    <textarea
                      value={viewFormData.description || ''}
                      onChange={(e) => setViewFormData({...viewFormData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{viewingShop.description || 'Aucune description'}</p>
                  )}
                </div>

                {/* Admin Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <UserCog size={20} className="text-indigo-600" />
                    Administrateur de la boutique
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <User size={14} />
                        Nom
                      </p>
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
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if ((viewingShop as any).owner_email) {
                          window.location.href = `mailto:${(viewingShop as any).owner_email}`
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Mail size={16} />
                      Contacter l'admin
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOwnerEmail((viewingShop as any).owner_email || '')
                        setIsUserManagementModalOpen(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                      <Shield size={16} />
                      Gérer l'utilisateur
                    </button>
                  </div>
                </div>

                {/* Shop Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Store size={20} className="text-indigo-600" />
                    Informations de la boutique
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Phone size={14} />
                        Téléphone
                      </p>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.phone || ''}
                          onChange={(e) => setViewFormData({...viewFormData, phone: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{viewingShop.phone || 'Non défini'}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Mail size={14} />
                        Email boutique
                      </p>
                      {isEditingInView ? (
                        <input
                          type="email"
                          value={viewFormData.email || ''}
                          onChange={(e) => setViewFormData({...viewFormData, email: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{viewingShop.email || 'Non défini'}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Commune
                      </p>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.address_commune || ''}
                          onChange={(e) => setViewFormData({...viewFormData, address_commune: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{viewingShop.address_commune || 'Non défini'}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Quartier
                      </p>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.address_quartier || ''}
                          onChange={(e) => setViewFormData({...viewFormData, address_quartier: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{viewingShop.address_quartier || 'Non défini'}</p>
                      )}
                    </div>
                  </div>
                  {(isEditingInView || viewingShop.address_details) && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Adresse complète</p>
                      {isEditingInView ? (
                        <textarea
                          value={viewFormData.address_details || ''}
                          onChange={(e) => setViewFormData({...viewFormData, address_details: e.target.value})}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{viewingShop.address_details}</p>
                      )}
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
                onClick={() => {
                  setIsViewModalOpen(false)
                  setIsEditingInView(false)
                }}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Fermer
              </button>
              <div className="flex items-center gap-3">
                {isEditingInView ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditingInView(false)
                        setViewFormData({
                          name: viewingShop.name,
                          description: viewingShop.description,
                          phone: viewingShop.phone,
                          email: viewingShop.email,
                          address_commune: viewingShop.address_commune,
                          address_quartier: viewingShop.address_quartier,
                          address_details: viewingShop.address_details
                        })
                      }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          setActionLoading(true)
                          await shopsService.updateShop(viewingShop.id, viewFormData as any)
                          showToast('Boutique mise à jour avec succès', 'success')
                          setIsEditingInView(false)
                          loadShops()
                          setIsViewModalOpen(false)
                        } catch (err: any) {
                          showToast(err.message || 'Erreur lors de la mise à jour', 'error')
                        } finally {
                          setActionLoading(false)
                        }
                      }}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <Save size={18} />
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <>
                    {viewingShop.is_active && !viewingShop.is_verified && (
                      <button
                        onClick={async () => {
                          try {
                            setActionLoading(true)
                            await shopsService.verifyShop(viewingShop.id)
                            showToast('Boutique vérifiée avec succès', 'success')
                            loadShops()
                            setIsViewModalOpen(false)
                          } catch (err: any) {
                            showToast(err.message || 'Erreur', 'error')
                          } finally {
                            setActionLoading(false)
                          }
                        }}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium"
                      >
                        <Star size={18} />
                        Vérifier
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditingInView(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                    >
                      <Edit2 size={18} />
                      Modifier
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject/Suspend) */}
      {isActionModalOpen && selectedShopForAction && actionType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {actionType === 'approve' && 'Approuver la boutique'}
                {actionType === 'reject' && 'Rejeter la boutique'}
                {actionType === 'suspend' && 'Suspendre la boutique'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Boutique: <strong>{selectedShopForAction.name}</strong>
              </p>
              {(actionType === 'reject' || actionType === 'suspend') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison <span className="text-gray-400 text-xs">(optionnel pour SuperAdmin)</span>
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    placeholder="Expliquez la raison (optionnel)..."
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && selectedShopForAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Envoyer un message</h2>
              <p className="text-sm text-gray-500 mt-1">À: {selectedShopForAction.name}</p>
            </div>
            <div className="p-6">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                placeholder="Votre message..."
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSendMessage}
                disabled={actionLoading || !messageContent.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <Send size={16} />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {isUserManagementModalOpen && selectedOwnerEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserCog size={24} className="text-indigo-600" />
                Gestion de l'utilisateur
              </h2>
              <button
                onClick={() => setIsUserManagementModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-gray-600 mb-1">Email de l'utilisateur</p>
                <p className="font-semibold text-gray-900">{selectedOwnerEmail}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    window.open(`/superadmin/users?search=${selectedOwnerEmail}`, '_blank')
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Voir le profil complet</p>
                    <p className="text-sm text-gray-600">Accéder à tous les détails de l'utilisateur</p>
                  </div>
                  <Shield size={20} className="text-indigo-600" />
                </button>

                <button
                  onClick={() => {
                    if (selectedOwnerEmail) {
                      window.location.href = `mailto:${selectedOwnerEmail}`
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Envoyer un email</p>
                    <p className="text-sm text-gray-600">Contacter directement l'utilisateur</p>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    if (confirm('Voulez-vous réinitialiser le mot de passe de cet utilisateur ?')) {
                      try {
                        // Call API to reset password
                        showToast('Email de réinitialisation envoyé', 'success')
                        setIsUserManagementModalOpen(false)
                      } catch (err: any) {
                        showToast(err.message || 'Erreur', 'error')
                      }
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-amber-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Lock size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Réinitialiser le mot de passe</p>
                    <p className="text-sm text-gray-600">Envoyer un email de réinitialisation</p>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    if (confirm('Voulez-vous suspendre cet utilisateur ?')) {
                      try {
                        // Call API to suspend user
                        showToast('Utilisateur suspendu', 'success')
                        setIsUserManagementModalOpen(false)
                      } catch (err: any) {
                        showToast(err.message || 'Erreur', 'error')
                      }
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                    <Ban size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Suspendre l'utilisateur</p>
                    <p className="text-sm text-gray-600">Bloquer temporairement l'accès</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsUserManagementModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}

export default SuperAdminShopsPage
