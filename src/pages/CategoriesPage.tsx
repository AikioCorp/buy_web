import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid3X3, ChevronRight, Package, Sparkles, Star, ShoppingCart, Heart, ArrowRight } from 'lucide-react'
import { categoriesService } from '../lib/api/categoriesService'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  image?: string
  icon?: string
  parent?: number | null
  children?: Category[]
  products_count?: number
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
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string | number) => new Intl.NumberFormat('fr-FR').format(Number(price))

  const getCategoryImage = (category: Category): string => {
    const categoryImages: Record<string, string> = {
      'electronique': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
      'mode': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop',
      'alimentaire': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
      'parfumerie': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
      'cuisine': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
      'sport': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop',
      'electromenager': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&h=100&fit=crop',
      'maison': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
      'beaute': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
      'informatique': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop',
      'jouets': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=100&h=100&fit=crop',
      'livres': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop',
    }
    return category.image_url || categoryImages[category.slug] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">
              TOUTES LES <span className="text-[#e8d20c]">CATÉGORIES</span>
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
                  
                  {/* Image */}
                  <div className={`w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <img src={getCategoryImage(category)} alt={category.name} className="w-full h-full object-cover" />
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

          </>
        )}
      </div>
    </div>
  )
}
