import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid3X3, ChevronRight, Package, Sparkles } from 'lucide-react'
import { categoriesService } from '../lib/api/categoriesService'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  icon?: string
  parent?: number | null
  children?: Category[]
  products_count?: number
}

const categoryIcons: Record<string, string> = {
  'electronique': '📱',
  'mode': '👗',
  'maison': '🏠',
  'sports': '⚽',
  'beaute': '💄',
  'alimentation': '🍎',
  'livres': '📚',
  'jouets': '🧸',
  'auto': '🚗',
  'jardin': '🌿',
}

const categoryColors: string[] = [
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-teal-600',
  'from-red-500 to-pink-600',
  'from-yellow-500 to-orange-600',
]

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesService.getCategories()
      if (response.data) {
        // Organiser les catégories parent/enfant
        const allCategories: Category[] = Array.isArray(response.data) ? response.data : []
        const parentCategories = allCategories.filter((c: Category) => !c.parent)
        const organizedCategories = parentCategories.map((parent: Category) => ({
          ...parent,
          children: allCategories.filter((c: Category) => c.parent === parent.id)
        }))
        setCategories(organizedCategories.length > 0 ? organizedCategories : allCategories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (category: Category) => {
    const slug = category.slug?.toLowerCase() || category.name.toLowerCase()
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (slug.includes(key)) return icon
    }
    return '📦'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0f4c2b] via-[#1a5f3a] to-[#0f4c2b] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Sparkles size={18} className="text-[#e8d20c]" />
              <span className="text-sm font-medium">Explorez par catégorie</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Toutes les <span className="text-[#e8d20c]">Catégories</span>
            </h1>
            <p className="text-lg text-white/80">
              Trouvez exactement ce que vous cherchez parmi nos différentes catégories de produits
            </p>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="h-16 bg-gray-50" style={{ 
          clipPath: 'ellipse(70% 100% at 50% 100%)',
          marginTop: '-1px'
        }}></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-8">
        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <Grid3X3 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune catégorie disponible</h3>
            <p className="text-gray-500">Les catégories seront bientôt disponibles</p>
          </div>
        ) : (
          <>
            {/* Main Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Background Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${categoryColors[index % categoryColors.length]} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {category.icon || getIcon(category)}
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#0f4c2b] transition-colors">
                    {category.name}
                  </h3>
                  
                  {category.products_count !== undefined && (
                    <p className="text-sm text-gray-500">
                      {category.products_count} produits
                    </p>
                  )}
                  
                  {/* Arrow */}
                  <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight size={18} className="text-[#0f4c2b]" />
                  </div>
                  
                  {/* Subcategories Preview */}
                  {category.children && category.children.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {category.children.slice(0, 3).map(sub => (
                          <span key={sub.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {sub.name}
                          </span>
                        ))}
                        {category.children.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-[#0f4c2b]/10 rounded-full text-[#0f4c2b] font-medium">
                            +{category.children.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Categories with Subcategories - Detailed View */}
            {categories.some(c => c.children && c.children.length > 0) && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="text-[#0f4c2b]" />
                  Explorer par sous-catégorie
                </h2>
                
                {categories.filter(c => c.children && c.children.length > 0).map((category, index) => (
                  <div key={category.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[index % categoryColors.length]} flex items-center justify-center text-2xl`}>
                        {category.icon || getIcon(category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                      <Link 
                        to={`/products?category=${category.slug}`}
                        className="ml-auto px-4 py-2 bg-[#0f4c2b] text-white rounded-lg text-sm font-medium hover:bg-[#1a5f3a] transition-colors"
                      >
                        Voir tout
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {category.children?.map(sub => (
                        <Link
                          key={sub.id}
                          to={`/products?category=${sub.slug}`}
                          className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#0f4c2b]/10 transition-colors">
                            <Package size={18} className="text-gray-400 group-hover:text-[#0f4c2b]" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#0f4c2b] transition-colors">
                            {sub.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
