import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSupabase } from '@buymore/api-client'
import { Card, CardContent } from '@/components/Card'
import { Store } from 'lucide-react'

export function ShopsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (data) setShops(data)
    } catch (error) {
      console.error('Error loading shops:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Toutes les boutiques</h1>
      
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} to={`/shops/${shop.id}`}>
              <Card className="hover:shadow-lg transition">
                <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{shop.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
                  {shop.city && <p className="text-xs text-gray-500 mt-2">{shop.city}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
