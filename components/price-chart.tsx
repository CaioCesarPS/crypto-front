'use client'

import { memo, useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'

interface ChartDataPoint {
  timestamp: number
  price: number
}

interface PriceChartProps {
  assetId: string
  assetName: string
}

function PriceChartComponent({ assetId, assetName }: PriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/assets/${assetId}/chart`)

      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }

      const chartData = await response.json()
      setData(chartData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>7-Day Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>7-Day Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message={error}
            onRetry={fetchChartData}
          />
        </CardContent>
      </Card>
    )
  }

  // Transform data for the chart
  const chartData = data.map(({ timestamp, price }) => ({
    date: new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    price,
  }))

  // Determine if price is up or down for coloring
  const firstPrice = data[0]?.price
  const lastPrice = data[data.length - 1]?.price
  const priceChange =
    data.length > 1 && firstPrice !== undefined && lastPrice !== undefined
      ? lastPrice - firstPrice
      : 0
  const lineColor = priceChange >= 0 ? '#22c55e' : '#ef4444'

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Price Chart - {assetName}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="date"
              className="text-xs"
              stroke="currentColor"
            />
            <YAxis
              tickFormatter={(value: number) => formatPrice(value, true)}
              className="text-xs"
              stroke="currentColor"
            />
            <Tooltip
              formatter={(value: number) => [formatPrice(value), 'Price']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Memoize to prevent unnecessary re-renders
export const PriceChart = memo(PriceChartComponent)
