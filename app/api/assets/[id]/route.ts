import { NextResponse } from 'next/server'
import type { AssetDetail } from '@/lib/types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

// Cache for asset details (5 minutes)
const cache = new Map<string, { data: AssetDetail; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check cache
    const cached = cache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Fetch detailed data from CoinGecko
    const url = `${COINGECKO_API_URL}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform data to match our needs
    const assetDetail = {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || data.image?.small,
      current_price: data.market_data?.current_price?.usd || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      market_cap_rank: data.market_cap_rank,
      total_volume: data.market_data?.total_volume?.usd || 0,
      price_change_percentage_24h:
        data.market_data?.price_change_percentage_24h || 0,
      price_change_percentage_7d:
        data.market_data?.price_change_percentage_7d || 0,
      price_change_percentage_30d:
        data.market_data?.price_change_percentage_30d || 0,
      circulating_supply: data.market_data?.circulating_supply || 0,
      total_supply: data.market_data?.total_supply || 0,
      max_supply: data.market_data?.max_supply || null,
      ath: data.market_data?.ath?.usd || 0,
      ath_change_percentage: data.market_data?.ath_change_percentage?.usd || 0,
      ath_date: data.market_data?.ath_date?.usd,
      atl: data.market_data?.atl?.usd || 0,
      atl_change_percentage: data.market_data?.atl_change_percentage?.usd || 0,
      atl_date: data.market_data?.atl_date?.usd,
      high_24h: data.market_data?.high_24h?.usd || 0,
      low_24h: data.market_data?.low_24h?.usd || 0,
      description: data.description?.en || '',
      homepage: data.links?.homepage?.[0] || '',
      blockchain_site:
        data.links?.blockchain_site?.filter((site: string) => site)?.[0] || '',
      categories: data.categories || [],
    }

    // Update cache
    cache.set(id, { data: assetDetail, timestamp: Date.now() })

    return NextResponse.json(assetDetail)
  } catch (error) {
    console.error('Error fetching asset details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset details' },
      { status: 500 }
    )
  }
}
