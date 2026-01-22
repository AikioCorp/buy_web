import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/utils'
import { Package } from 'lucide-react'
import { Card, CardContent } from '../components/Card'
import { Hero } from '../components/Hero'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'

export function HomePage() {
  const { products, isLoading: productsLoading, refresh: refreshProducts } = useProducts()
  const { categories, isLoading: categoriesLoading } = useCategories()

  useEffect(() => {
    refreshProducts()
  }, [])

  const loading = productsLoading || categoriesLoading
  const displayProducts = products?.slice(0, 8) || []
  const displayCategories = categories?.slice(0, 6) || []

  return (
    <div>
      <Hero />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Catégories populaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shops?category=${category.slug}`}
                className="p-6 border rounded-lg hover:border-primary hover:shadow-md transition text-center"
              >
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Produits récents</h2>
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card className="hover:shadow-lg transition">
                    <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                      {product.media?.[0]?.image_url ? (
                        <img
                          src={product.media[0].image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.store?.name}</p>
                      <p className="text-lg font-bold text-primary">
                        {parseFloat(product.base_price).toLocaleString()} FCFA
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
