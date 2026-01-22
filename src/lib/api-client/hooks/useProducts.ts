import { useState, useEffect } from 'react'
import { getSupabase } from '../client'
import { Product } from '../types'

export function useProducts(filters?: {
  shop_id?: string
  category_id?: string
  search?: string
  limit?: number
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadProducts()
  }, [filters?.shop_id, filters?.category_id, filters?.search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      let query = supabase
        .from('products')
        .select(`
          *,
          shop:shops(id, name, slug, logo_url),
          category:categories(id, name, slug),
          images:product_images(*)
        `)
        .eq('is_active', true)

      if (filters?.shop_id) {
        query = query.eq('shop_id', filters.shop_id)
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      query = query.limit(filters?.limit || 50).order('created_at', { ascending: false })

      const { data, error: queryError } = await query

      if (queryError) throw queryError
      setProducts(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, refetch: loadProducts }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: queryError } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(id, name, slug, logo_url, city, country),
          category:categories(id, name, slug),
          images:product_images(*)
        `)
        .eq('id', id)
        .single()

      if (queryError) throw queryError
      setProduct(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { product, loading, error, refetch: loadProduct }
}
