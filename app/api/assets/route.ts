import { NextResponse } from 'next/server'
import type { CryptoAsset } from '@/lib/types'
import { assetsCache } from '@/lib/cache'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets'

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page') || '1'
    const perPageParam = searchParams.get('per_page') || '10'

    // Parse and validate pagination parameters
    const parsedPage = parseInt(pageParam, 10)
    const parsedPerPage = parseInt(perPageParam, 10)

    const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage)
    const perPage = Number.isNaN(parsedPerPage)
      ? 10
      : Math.min(250, Math.max(1, parsedPerPage))

    // Create cache key
    const cacheKey = `${page}-${perPage}`

    // Check if cache is valid
    const cached = assetsCache.get(cacheKey)
    if (assetsCache.isValid(cached)) {
      return NextResponse.json({
        assets: cached!.data,
        page,
        perPage,
        hasMore: cached!.data.length === perPage,
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
    assetsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })

    // Clean old cache entries (keep last 10 pages)
    if (assetsCache.size > 10) {
      const firstKey = assetsCache.keys().next().value
      if (firstKey) assetsCache.delete(firstKey)
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
