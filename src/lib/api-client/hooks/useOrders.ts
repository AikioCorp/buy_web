import { useState, useEffect } from 'react'
import { getSupabase } from '../client'
import { Order } from '../types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, slug),
            shop:shops(id, name, slug)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setOrders(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, refetch: loadOrders }
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, slug),
            shop:shops(id, name, slug)
          )
        `)
        .eq('id', id)
        .single()

      if (queryError) throw queryError
      setOrder(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { order, loading, error, refetch: loadOrder }
}
