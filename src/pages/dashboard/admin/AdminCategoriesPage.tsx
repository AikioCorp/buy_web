import React, { useState, useEffect } from 'react'
import { 
  FolderTree, Search, Plus, Edit2, Trash2,
  Loader2, RefreshCw, Package, Lock, MoreVertical, Upload, X
} from 'lucide-react'
import { useToast } from '../../../components/Toast'
import { categoriesService } from '../../../lib/api/categoriesService'
import { usePermissions } from '../../../hooks/usePermissions'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  parent_name?: string
  products_count: number
  is_active: boolean
  created_at: string
}

const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast()
  const { canViewProducts, canCreateProducts, canEditProducts, canDeleteProducts, isSuperAdmin } = usePermissions()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', parent_id: '' })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [removeExistingIcon, setRemoveExistingIcon] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasAccess = isSuperAdmin || canViewProducts()
  const canCreate = isSuperAdmin || canCreateProducts()
  const canEdit = isSuperAdmin || canEditProducts()
  const canDelete = isSuperAdmin || canDeleteProducts()

  useEffect(() => {
    if (hasAccess) {
      loadCategories()
    }
  }, [hasAccess])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesService.getCategories()
      if (response.data) {
        const cats = Array.isArray(response.data) ? response.data : (response.data as any).results || []
        setCategories(cats.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
          description: cat.description,
          image: cat.image,
          parent_id: cat.parent_id || cat.parent,
          parent_name: cat.parent_name,
          products_count: cat.products_count || 0,
          is_active: cat.is_active !== false,
          created_at: cat.created_at || new Date().toISOString()
        })))
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!canCreate) {
      showToast('Permission insuffisante', 'error')
      return
    }
    if (!formData.name.trim()) {
      showToast('Le nom est requis', 'error')
      return
    }
    try {
      setSaving(true)
      await categoriesService.createCategory({
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        parent: formData.parent_id ? parseInt(formData.parent_id) : undefined,
        icon: iconFile || undefined
      })
      showToast('Catégorie créée', 'success')
      setIsCreateModalOpen(false)
      setFormData({ name: '', description: '', parent_id: '' })
      setIconFile(null)
      setIconPreview(null)
      loadCategories()
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!canEdit || !selectedCategory) {
      showToast('Permission insuffisante', 'error')
      return
    }
    try {
      setSaving(true)
      console.log('Updating category with removeExistingIcon:', removeExistingIcon)
      await categoriesService.updateCategory(selectedCategory.slug, {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        parent: formData.parent_id ? parseInt(formData.parent_id) : undefined,
        icon: iconFile || undefined,
        remove_image: removeExistingIcon
      })
      showToast('Catégorie mise à jour', 'success')
      setIsEditModalOpen(false)
      setIconFile(null)
      setIconPreview(null)
      setRemoveExistingIcon(false)
      loadCategories()
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!canDelete) {
      showToast('Permission insuffisante', 'error')
      return
    }
    if (!window.confirm(`Supprimer la catégorie "${category.name}"?`)) return
    try {
      await categoriesService.deleteCategory(category.slug)
      showToast('Catégorie supprimée', 'success')
      loadCategories()
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    }
  }

  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id?.toString() || ''
    })
    setIconFile(null)
    setIconPreview(category.image || null)
    setRemoveExistingIcon(false)
    setIsEditModalOpen(true)
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
    setRemoveExistingIcon(true)
    console.log('Icon marked for removal')
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Permission denied view
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-500 text-center max-w-md">
          Vous n'avez pas la permission d'accéder à cette page.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white">
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
              <span className="font-medium">{categories.length} catégories</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="font-medium">{categories.filter(c => c.is_active).length} actives</span>
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
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
            />
          </div>
          <button 
            onClick={loadCategories}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="font-medium">Actualiser</span>
          </button>
          {canCreate && (
            <button 
              onClick={() => {
                setFormData({ name: '', description: '', parent_id: '' })
                setIsCreateModalOpen(true)
              }}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium">Nouvelle catégorie</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
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
            >
              {/* Image */}
              <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderTree className="w-12 h-12 text-emerald-400" />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                    {category.parent_name && (
                      <p className="text-sm text-gray-500">Parent: {category.parent_name}</p>
                    )}
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package size={16} />
                    <span>{category.products_count} produits</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle catégorie</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                  placeholder="Ex: Électronique"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône / Image</label>
                <div className="flex items-center gap-4">
                  {iconPreview ? (
                    <div className="relative">
                      <img src={iconPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeIcon()
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg z-10"
                        title="Supprimer l'image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FolderTree className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 transition-colors">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                  rows={3}
                  placeholder="Description de la catégorie..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie parente</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Modifier la catégorie</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône / Image</label>
                <div className="flex items-center gap-4">
                  {iconPreview ? (
                    <div className="relative">
                      <img src={iconPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeIcon()
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg z-10"
                        title="Supprimer l'image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FolderTree className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 transition-colors">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie parente</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {categories.filter(cat => cat.id !== selectedCategory.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesPage
