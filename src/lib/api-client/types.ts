export interface User {
  id: string
  role: 'customer' | 'vendor' | 'admin'
  full_name: string
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface Shop {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  cover_url?: string
  status: 'pending' | 'approved' | 'blocked'
  address?: string
  city?: string
  country?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
  icon?: string
  created_at: string
}

export interface Product {
  id: string
  shop_id: string
  category_id: string
  name: string
  slug: string
  description?: string
  price: number
  currency: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  shop?: Shop
  category?: Category
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  position: number
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  payment_status: 'unpaid' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  shop_id: string
  unit_price: number
  quantity: number
  created_at: string
  product?: Product
  shop?: Shop
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  shop_id: string
  shop_name: string
}
