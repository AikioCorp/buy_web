import React, { useState, useEffect } from 'react'
import { Search, FolderTree, Edit2, Trash2, X, Save, Plus, Star, ChevronRight, Upload } from 'lucide-react'
import { categoriesService, Category, CreateCategoryData } from '../../../lib/api/categoriesService'

const SuperAdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [formData, setFormData] = useState<Partial<CreateCategoryData>>({})
  const [createFormData, setCreateFormData] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    parent: null,
    en_vedette: false
  })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await categoriesService.getAllCategoriesAdmin()
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setCategories(response.data)
        } else {
          setCategories([])
        }
      }
    } catch (err: any) {
      console.error('Erreur API:', err)
      // Fallback to public endpoint
      try {
        const publicResponse = await categoriesService.getCategories()
        if (publicResponse.data) {
          setCategories(Array.isArray(publicResponse.data) ? publicResponse.data : [])
        }
      } catch {
        setError(err.message || 'Erreur lors du chargement des catégories')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      parent: category.parent,
      en_vedette: category.en_vedette
    })
    setIconFile(null)
    setIconPreview(category.icon || null)
    setIsEditModalOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return
    
    try {
      setActionLoading(true)
      await categoriesService.updateCategory(editingCategory.slug, {
        ...formData,
        icon: iconFile || undefined
      })
      setIsEditModalOpen(false)
      setEditingCategory(null)
      setIconFile(null)
      setIconPreview(null)
      loadCategories()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour de la catégorie')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      setActionLoading(true)
      await categoriesService.deleteCategory(categoryToDelete.slug)
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
      loadCategories()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression de la catégorie')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateCategory = () => {
    setCreateFormData({
      name: '',
      slug: '',
      parent: null,
      en_vedette: false
    })
    setIconFile(null)
    setIconPreview(null)
    setIsCreateModalOpen(true)
  }

  const handleSaveNewCategory = async () => {
    if (!createFormData.name || !createFormData.slug) {
      alert('Veuillez remplir tous les champs obligatoires (nom, slug)')
      return
    }
    
    try {
      setActionLoading(true)
      await categoriesService.createCategory({
        ...createFormData,
        icon: iconFile || undefined
      })
      setIsCreateModalOpen(false)
      setIconFile(null)
      setIconPreview(null)
      loadCategories()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la catégorie')
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

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeIcon = () => {
    setIconFile(null)
    setIconPreview(null)
  }

  // Flatten categories for display with hierarchy
  const flattenCategories = (cats: Category[], level: number = 0): Array<Category & { level: number }> => {
    let result: Array<Category & { level: number }> = []
    for (const cat of cats) {
      result.push({ ...cat, level })
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1))
      }
    }
    return result
  }

  const flatCategories = flattenCategories(categories || [])
  const filteredCategories = searchQuery
    ? flatCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : flatCategories

  // Get parent categories for select
  const parentCategories = (categories || []).filter(cat => !cat.parent)

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
          <p className="text-gray-600 mt-1">
            {flatCategories.length} catégorie{flatCategories.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button 
          onClick={handleCreateCategory}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} />
          Nouvelle Catégorie
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadCategories}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucune catégorie trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En Vedette
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sous-catégories
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div style={{ marginLeft: `${category.level * 24}px` }} className="flex items-center">
                          {category.level > 0 && (
                            <ChevronRight size={16} className="text-gray-400 mr-2" />
                          )}
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FolderTree className="text-indigo-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.en_vedette ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star size={12} />
                          Vedette
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {category.children?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(category)}
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
        )}
      </div>

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Modifier la catégorie</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value, false)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icône / Image</label>
                <div className="flex items-center gap-4">
                  {iconPreview ? (
                    <div className="relative">
                      <img src={iconPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={removeIcon}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FolderTree className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors">
                      <Upload size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-600">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie parente</label>
                <select
                  value={formData.parent || ''}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {parentCategories.filter(c => c.id !== editingCategory.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="en_vedette"
                  checked={formData.en_vedette || false}
                  onChange={(e) => setFormData({ ...formData, en_vedette: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="en_vedette" className="ml-2 text-sm text-gray-700">
                  Mettre en vedette
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
                onClick={handleSaveCategory}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle catégorie</h2>
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
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icône / Image</label>
                <div className="flex items-center gap-4">
                  {iconPreview ? (
                    <div className="relative">
                      <img src={iconPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={removeIcon}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FolderTree className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors">
                      <Upload size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-600">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.slug}
                  onChange={(e) => setCreateFormData({ ...createFormData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie parente</label>
                <select
                  value={createFormData.parent || ''}
                  onChange={(e) => setCreateFormData({ ...createFormData, parent: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="create_en_vedette"
                  checked={createFormData.en_vedette || false}
                  onChange={(e) => setCreateFormData({ ...createFormData, en_vedette: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="create_en_vedette" className="ml-2 text-sm text-gray-700">
                  Mettre en vedette
                </label>
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
                onClick={handleSaveNewCategory}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Créer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Supprimer la catégorie</h2>
                  <p className="text-sm text-gray-600">Cette action est irréversible</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer la catégorie <strong>{categoryToDelete.name}</strong> ?
                {categoryToDelete.children && categoryToDelete.children.length > 0 && (
                  <span className="block mt-2 text-red-600 text-sm">
                    ⚠️ Cette catégorie contient {categoryToDelete.children.length} sous-catégorie(s) qui seront également supprimées.
                  </span>
                )}
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

export default SuperAdminCategoriesPage
