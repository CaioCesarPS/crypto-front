import { NextResponse } from 'next/server'
import type { CryptoAsset } from '@/lib/types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets'

// Enhanced cache to support pagination
// Key format: "page-perPage" (e.g., "1-20", "2-20")
const cache = new Map<string, { data: CryptoAsset[]; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 60 seconds

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const perPage = Math.min(
      250,
      Math.max(1, parseInt(searchParams.get('per_page') || '20', 10))
    )

    // Create cache key
    const cacheKey = `${page}-${perPage}`

    // Check if cache is valid
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        assets: cached.data,
        page,
        perPage,
        hasMore: cached.data.length === perPage,
      })
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_URL}?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch crypto assets')
    }

    const data: CryptoAsset[] = await response.json()

    // Update cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    // Clean old cache entries (keep last 10 pages)
    if (cache.size > 10) {
      const firstKey = cache.keys().next().value
      if (firstKey) cache.delete(firstKey)
    }

    return NextResponse.json({
      assets: data,
      page,
      perPage,
      hasMore: data.length === perPage,
    })
  } catch (error) {
    console.error('Error fetching crypto assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto assets' },
      { status: 500 }
    )
  }
}
