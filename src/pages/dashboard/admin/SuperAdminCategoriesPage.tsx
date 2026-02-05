import React, { useState, useEffect } from 'react'
import { Search, FolderTree, Edit2, Trash2, X, Save, Plus, Star, ChevronRight, Upload, Loader2, RefreshCw, Package, MoreVertical } from 'lucide-react'
import { categoriesService, Category, CreateCategoryData } from '../../../lib/api/categoriesService'
import { useToast } from '../../../components/Toast'

const SuperAdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast()
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
      showToast('Catégorie mise à jour avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour de la catégorie', 'error')
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
      showToast('Catégorie supprimée avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression de la catégorie', 'error')
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
      showToast('Veuillez remplir tous les champs obligatoires (nom, slug)', 'error')
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
      showToast('Catégorie créée avec succès', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de la catégorie', 'error')
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FolderTree className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
              <p className="text-white/80 mt-1">Organisez vos produits par catégories</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="font-medium">{flatCategories.length} catégories</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="font-medium">{flatCategories.filter(c => c.en_vedette).length} en vedette</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <button 
            onClick={loadCategories}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="font-medium">Actualiser</span>
          </button>
          <button 
            onClick={handleCreateCategory}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">Nouvelle catégorie</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCategories}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune catégorie</h3>
          <p className="text-gray-500">Commencez par créer votre première catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              style={{ marginLeft: `${category.level * 16}px` }}
            >
              {/* Image */}
              <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                {category.icon ? (
                  <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderTree className="w-12 h-12 text-indigo-400" />
                )}
                {category.en_vedette && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      Vedette
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {category.level > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <ChevronRight size={12} />
                        <span>Sous-catégorie</span>
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.slug}</p>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package size={16} />
                    <span>{category.children?.length || 0} sous-catégories</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
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

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
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

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNewCategory}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
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
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    {actionLoading && <Loader2 size={16} className="animate-spin" />}
                    Supprimer
                  </div>
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
