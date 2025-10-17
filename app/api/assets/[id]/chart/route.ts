import { NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

// Cache for chart data (5 minutes)
const cache = new Map<string, { data: ChartDataPoint[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface ChartDataPoint {
  timestamp: number
  price: number
}

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

    // Fetch 7-day price history from CoinGecko
    const url = `${COINGECKO_API_URL}/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform data to our format
    const chartData: ChartDataPoint[] = data.prices.map(
      (point: [number, number]) => ({
        timestamp: point[0],
        price: point[1],
      })
    )

    // Update cache
    cache.set(id, { data: chartData, timestamp: Date.now() })

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
