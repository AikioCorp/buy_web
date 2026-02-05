import React, { useState, useEffect } from 'react'
import { Search, UtensilsCrossed, Edit2, Trash2, X, Save, Plus, CheckCircle, XCircle } from 'lucide-react'
import { shopsService, Shop, CreateShopData } from '../../../lib/api/shopsService'
import { useToast } from '../../../components/Toast'

const SuperAdminRestaurantsPage: React.FC = () => {
  const { showToast } = useToast()
  const [restaurants, setRestaurants] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [editingRestaurant, setEditingRestaurant] = useState<Shop | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState<Shop | null>(null)
  const [formData, setFormData] = useState<Partial<Shop>>({})
  const [createFormData, setCreateFormData] = useState<CreateShopData>({
    name: '',
    slug: '',
    description: '',
    is_active: false
  })
  const [actionLoading, setActionLoading] = useState(false)

  const pageSize = 20

  useEffect(() => {
    loadRestaurants()
  }, [currentPage, searchQuery])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await shopsService.getAllShopsAdmin({
        page: currentPage,
        search: searchQuery || undefined
      })

      console.log('Restaurants response:', response)

      if (response.data) {
        if (Array.isArray(response.data)) {
          setRestaurants(response.data)
          setTotalCount(response.data.length)
        } else if (response.data.results) {
          setRestaurants(response.data.results)
          setTotalCount(response.data.count)
        } else {
          setRestaurants([])
          setTotalCount(0)
        }
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      setError(err.message || 'Erreur lors du chargement des restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadRestaurants()
  }

  const handleEditRestaurant = (restaurant: Shop) => {
    setEditingRestaurant(restaurant)
    setFormData({
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      is_active: restaurant.is_active
    })
    setIsEditModalOpen(true)
  }

  const handleSaveRestaurant = async () => {
    if (!editingRestaurant) return
    
    try {
      setActionLoading(true)
      await shopsService.updateShop(editingRestaurant.id, formData)
      setIsEditModalOpen(false)
      setEditingRestaurant(null)
      loadRestaurants()
      showToast('Restaurant mis à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du restaurant', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (restaurant: Shop) => {
    setRestaurantToDelete(restaurant)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!restaurantToDelete) return
    
    try {
      setActionLoading(true)
      await shopsService.deleteShopAdmin(restaurantToDelete.id)
      setIsDeleteModalOpen(false)
      setRestaurantToDelete(null)
      loadRestaurants()
      showToast('Restaurant supprimé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression du restaurant', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateRestaurant = () => {
    setCreateFormData({
      name: '',
      slug: '',
      description: '',
      is_active: false
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveNewRestaurant = async () => {
    if (!createFormData.name || !createFormData.slug) {
      showToast('Veuillez remplir tous les champs obligatoires (nom, slug)', 'error')
      return
    }
    
    try {
      setActionLoading(true)
      await shopsService.createShop(createFormData)
      setIsCreateModalOpen(false)
      loadRestaurants()
      showToast('Restaurant créé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création du restaurant', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleValidateRestaurant = async (restaurant: Shop) => {
    try {
      setActionLoading(true)
      await shopsService.validateShop(restaurant.id)
      loadRestaurants()
      showToast('Restaurant validé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la validation du restaurant', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivateRestaurant = async (restaurant: Shop) => {
    try {
      setActionLoading(true)
      await shopsService.deactivateShop(restaurant.id)
      loadRestaurants()
      showToast('Restaurant désactivé avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la désactivation du restaurant', 'error')
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
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} />
          Validé
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <XCircle size={12} />
        En attente
      </span>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  // Stats
  const pendingCount = (restaurants || []).filter(r => !r.is_active).length
  const activeCount = (restaurants || []).filter(r => r.is_active).length

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Restaurants</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} restaurant{totalCount > 1 ? 's' : ''} au total
          </p>
        </div>
        <button 
          onClick={handleCreateRestaurant}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus size={18} />
          Nouveau Restaurant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="text-orange-600" size={20} />
            <span className="text-sm font-medium text-orange-800">Total</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-2">{totalCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-800">Validés</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{activeCount}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2">
            <XCircle className="text-yellow-600" size={20} />
            <span className="text-sm font-medium text-yellow-800">En attente</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">{pendingCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Rechercher
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadRestaurants}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Réessayer
            </button>
          </div>
        ) : (restaurants || []).length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun restaurant trouvé
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(restaurants || []).map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <UtensilsCrossed className="text-orange-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{restaurant.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {restaurant.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(restaurant.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {!restaurant.is_active ? (
                            <button 
                              onClick={() => handleValidateRestaurant(restaurant)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                              title="Valider"
                              disabled={actionLoading}
                            >
                              <CheckCircle size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDeactivateRestaurant(restaurant)}
                              className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded bg-yellow-50 hover:bg-yellow-100"
                              title="Désactiver"
                              disabled={actionLoading}
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditRestaurant(restaurant)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(restaurant)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Restaurant Modal */}
      {isEditModalOpen && editingRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Modifier le restaurant</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value, false)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Description du restaurant..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Restaurant validé et actif</span>
                </label>
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
                onClick={handleSaveRestaurant}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
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

      {/* Create Restaurant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nouveau restaurant</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du restaurant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.slug}
                  onChange={(e) => setCreateFormData({ ...createFormData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Description du restaurant..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Les nouveaux restaurants doivent être validés par l'équipe BUY MORE avant d'être publiés.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNewRestaurant}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Créer le restaurant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && restaurantToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Supprimer le restaurant</h2>
                  <p className="text-sm text-gray-600">Cette action est irréversible</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer le restaurant <strong>{restaurantToDelete.name}</strong> ?
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
    </div>
  )
}

export default SuperAdminRestaurantsPage
