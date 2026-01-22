import { useState, useEffect } from 'react'
import { getSupabase } from '../client'
import { Shop } from '../types'

export function useShops(status: 'pending' | 'approved' | 'blocked' = 'approved') {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadShops()
  }, [status])

  const loadShops = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: queryError } = await supabase
        .from('shops')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setShops(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { shops, loading, error, refetch: loadShops }
}

export function useShop(id: string) {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (id) {
      loadShop()
    }
  }, [id])

  const loadShop = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: queryError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single()

      if (queryError) throw queryError
      setShop(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { shop, loading, error, refetch: loadShop }
}
