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

// Catégories fictives avec images d'illustration
const mockCategories: Category[] = [
  { id: 1, name: 'Électronique', slug: 'electronique', description: 'Smartphones, ordinateurs, tablettes et accessoires', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop', products_count: 156 },
  { id: 2, name: 'Mode', slug: 'mode', description: 'Vêtements, chaussures et accessoires de mode', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop', products_count: 234 },
  { id: 3, name: 'Sport', slug: 'sport', description: 'Équipements sportifs et vêtements de sport', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop', products_count: 89 },
  { id: 4, name: 'Parfumerie', slug: 'parfumerie', description: 'Parfums, cosmétiques et soins beauté', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', products_count: 178 },
  { id: 5, name: 'Cuisine', slug: 'cuisine', description: 'Ustensiles, électroménager et accessoires cuisine', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop', products_count: 145 },
  { id: 6, name: 'Alimentaire', slug: 'alimentaire', description: 'Produits alimentaires, épicerie et boissons', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop', products_count: 267 },
  { id: 7, name: 'Électroménager', slug: 'electromenager', description: 'TV, climatiseurs, réfrigérateurs et plus', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop', products_count: 98 },
  { id: 8, name: 'Maison', slug: 'maison', description: 'Décoration, mobilier et aménagement', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop', products_count: 123 },
]

// Produits fictifs par catégorie
const mockProductsByCategory: Record<string, any[]> = {
  'electronique': [
    { id: 101, name: 'iPhone 15 Pro Max', base_price: '850000', media: [{ image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop' }] },
    { id: 102, name: 'AirPods Pro 2', base_price: '175000', media: [{ image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop' }] },
    { id: 109, name: 'MacBook Air M3', base_price: '1200000', media: [{ image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' }] },
    { id: 111, name: 'Samsung Galaxy S24', base_price: '950000', media: [{ image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop' }] },
  ],
  'mode': [
    { id: 103, name: 'Robe Africaine Wax', base_price: '35000', media: [{ image_url: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop' }] },
    { id: 110, name: 'Boubou Bazin Riche', base_price: '75000', media: [{ image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop' }] },
    { id: 119, name: 'Chemise Bogolan', base_price: '28000', media: [{ image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' }] },
    { id: 125, name: 'Sac Louis Vuitton', base_price: '450000', media: [{ image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' }] },
  ],
  'sport': [
    { id: 104, name: 'Nike Air Max 270', base_price: '95000', media: [{ image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' }] },
    { id: 116, name: 'Ballon Adidas Pro', base_price: '35000', media: [{ image_url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop' }] },
    { id: 123, name: 'Sneakers Adidas', base_price: '75000', media: [{ image_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=400&fit=crop' }] },
    { id: 129, name: 'Vélo VTT Pro', base_price: '350000', media: [{ image_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop' }] },
  ],
  'parfumerie': [
    { id: 106, name: 'Parfum Dior Sauvage', base_price: '145000', media: [{ image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop' }] },
    { id: 117, name: 'Parfum Chanel N°5', base_price: '185000', media: [{ image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=400&fit=crop' }] },
    { id: 126, name: 'Lunettes Ray-Ban', base_price: '125000', media: [{ image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop' }] },
    { id: 124, name: 'Montre Rolex', base_price: '2500000', media: [{ image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }] },
  ],
  'cuisine': [
    { id: 107, name: 'Set Casseroles Inox', base_price: '65000', media: [{ image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' }] },
    { id: 118, name: 'Robot Cuisine', base_price: '125000', media: [{ image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop' }] },
    { id: 130, name: 'Machine à Café', base_price: '185000', media: [{ image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop' }] },
  ],
  'alimentaire': [
    { id: 108, name: 'Riz Parfumé Thaï 5kg', base_price: '12500', media: [{ image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop' }] },
    { id: 115, name: 'Miel Pays Dogon 1kg', base_price: '15000', media: [{ image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop' }] },
  ],
  'electromenager': [
    { id: 112, name: 'TV Samsung 55" 4K', base_price: '450000', media: [{ image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop' }] },
    { id: 113, name: 'Climatiseur 12000 BTU', base_price: '285000', media: [{ image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=400&fit=crop' }] },
  ],
  'maison': [
    { id: 114, name: 'Canapé 3 Places', base_price: '350000', media: [{ image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' }] },
  ],
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
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data)
      } else {
        setCategories(mockCategories)
      }
    } catch (error) {
      setCategories(mockCategories)
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

            {/* Produits par catégorie */}
            <div className="space-y-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="text-[#0f4c2b]" />
                Découvrez nos produits par catégorie
              </h2>
              
              {categories.map((category, index) => {
                const products = mockProductsByCategory[category.slug] || []
                if (products.length === 0) return null
                
                return (
                  <div key={category.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[index % categoryColors.length]} flex items-center justify-center text-2xl`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <Link 
                        to={`/products?category=${category.slug}`}
                        className="ml-auto px-4 py-2 bg-[#0f4c2b] text-white rounded-lg text-sm font-medium hover:bg-[#1a5f3a] transition-colors flex items-center gap-2"
                      >
                        Voir tout <ArrowRight size={16} />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {products.map((product: any) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="relative aspect-square bg-white overflow-hidden">
                            <img 
                              src={product.media[0]?.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                                <Heart size={14} />
                              </button>
                              <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                                <ShoppingCart size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors">{product.name}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-green-600 font-bold text-sm mt-1">{formatPrice(product.base_price)} FCFA</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
