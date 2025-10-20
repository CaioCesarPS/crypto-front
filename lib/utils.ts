import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price to USD currency
export function formatPrice(
  price: number | null | undefined,
  compact = false
): string {
  // Handle null, undefined, or non-numeric values
  if (price === null || price === undefined || !isFinite(price)) {
    return '$0.00'
  }

  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(price)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(price)
}

// Format percentage change
export function formatPercentage(
  percentage: number | null | undefined
): string {
  // Handle null, undefined, or non-numeric values
  if (
    percentage === null ||
    percentage === undefined ||
    !isFinite(percentage)
  ) {
    return '0.00%'
  }

  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

// Get color class for percentage change
export function getPercentageColor(percentage: number): string {
  return percentage >= 0 ? 'text-green-600' : 'text-red-600'
}
