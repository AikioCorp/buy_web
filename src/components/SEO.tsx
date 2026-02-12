import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  product?: {
    name: string
    price: number
    currency?: string
    availability?: 'in_stock' | 'out_of_stock'
    category?: string
    brand?: string
    sku?: string
    rating?: number
    reviewCount?: number
  }
}

const SITE_NAME = 'BuyMore'
const DEFAULT_DESCRIPTION = 'BuyMore - La marketplace en ligne pour acheter et vendre au Mali'
const DEFAULT_IMAGE = 'https://buymore.ml/og-image.png'

export function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  product 
}: SEOProps) {
  
  useEffect(() => {
    // Update document title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    document.title = fullTitle

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attr, name)
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    // Basic meta tags
    setMetaTag('description', description || DEFAULT_DESCRIPTION)
    
    // Open Graph tags
    setMetaTag('og:title', fullTitle, true)
    setMetaTag('og:description', description || DEFAULT_DESCRIPTION, true)
    setMetaTag('og:image', image || DEFAULT_IMAGE, true)
    setMetaTag('og:type', type, true)
    setMetaTag('og:site_name', SITE_NAME, true)
    if (url) setMetaTag('og:url', url, true)

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', fullTitle)
    setMetaTag('twitter:description', description || DEFAULT_DESCRIPTION)
    setMetaTag('twitter:image', image || DEFAULT_IMAGE)

    // Product-specific structured data (JSON-LD)
    if (product) {
      // Remove existing product schema
      const existingSchema = document.querySelector('script[data-schema="product"]')
      if (existingSchema) existingSchema.remove()

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: description || '',
        image: image || DEFAULT_IMAGE,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'XOF',
          availability: product.availability === 'in_stock' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: product.brand || SITE_NAME
          }
        },
        ...(product.category && { category: product.category }),
        ...(product.sku && { sku: product.sku }),
        ...(product.rating && product.reviewCount && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount
          }
        })
      }

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-schema', 'product')
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    }

    // Cleanup on unmount
    return () => {
      const productSchema = document.querySelector('script[data-schema="product"]')
      if (productSchema) productSchema.remove()
    }
  }, [title, description, image, url, type, product])

  return null
}

export default SEO
