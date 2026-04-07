import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(value: number | string | null | undefined): string {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0
  const safeAmount = Number.isFinite(amount) ? amount : 0

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  })
    .format(safeAmount)
    .replace(/\u202f/g, ' ')
    .replace(/\u00a0/g, ' ')
}

export function formatPrice(price: number | string, currency: string = 'XOF'): string {
  const currencyLabel = currency === 'XOF' ? 'FCFA' : currency
  return `${formatAmount(price)} ${currencyLabel}`.trim()
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
