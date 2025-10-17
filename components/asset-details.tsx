'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'
import { formatPrice, formatPercentage, getPercentageColor } from '@/lib/utils'
import type { AssetDetail } from '@/lib/types'

interface AssetDetailsProps {
  asset: AssetDetail
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function AssetDetails({
  asset,
  isFavorite,
  onToggleFavorite,
}: AssetDetailsProps) {
  const formatSupply = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Image
              src={asset.image}
              alt={asset.name}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{asset.name}</h1>
                <Badge
                  variant="secondary"
                  className="text-lg"
                >
                  {asset.symbol.toUpperCase()}
                </Badge>
                <Badge variant="outline">Rank #{asset.market_cap_rank}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div>
                  <p className="text-4xl font-bold">
                    {formatPrice(asset.current_price)}
                  </p>
                </div>
                <Badge
                  variant={
                    asset.price_change_percentage_24h >= 0
                      ? 'default'
                      : 'destructive'
                  }
                  className="text-lg px-3 py-1"
                >
                  {asset.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {formatPercentage(asset.price_change_percentage_24h)}
                </Badge>
              </div>
            </div>
            {onToggleFavorite && (
              <Button
                variant={isFavorite ? 'default' : 'outline'}
                size="lg"
                onClick={onToggleFavorite}
              >
                {isFavorite ? '★ Remove from Favorites' : '☆ Add to Favorites'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPrice(asset.market_cap)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPrice(asset.total_volume)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Circulating Supply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatSupply(asset.circulating_supply)}
            </p>
            <p className="text-sm text-muted-foreground">
              {asset.symbol.toUpperCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h High / Low
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatPrice(asset.high_24h)}
            </p>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatPrice(asset.low_24h)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Supply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatSupply(asset.total_supply)}
            </p>
            {asset.max_supply && (
              <p className="text-sm text-muted-foreground">
                Max: {formatSupply(asset.max_supply)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Price Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">7 days:</span>
              <span
                className={`font-semibold ${getPercentageColor(
                  asset.price_change_percentage_7d
                )}`}
              >
                {formatPercentage(asset.price_change_percentage_7d)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">30 days:</span>
              <span
                className={`font-semibold ${getPercentageColor(
                  asset.price_change_percentage_30d
                )}`}
              >
                {formatPercentage(asset.price_change_percentage_30d)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All-Time High/Low */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All-Time High</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{formatPrice(asset.ath)}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatDate(asset.ath_date)}
              </span>
              <span className={getPercentageColor(asset.ath_change_percentage)}>
                {formatPercentage(asset.ath_change_percentage)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All-Time Low</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">{formatPrice(asset.atl)}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatDate(asset.atl_date)}
              </span>
              <span className={getPercentageColor(asset.atl_change_percentage)}>
                {formatPercentage(asset.atl_change_percentage)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {asset.description && (
        <Card>
          <CardHeader>
            <CardTitle>About {asset.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  asset.description.split('. ').slice(0, 3).join('. ') + '.',
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {asset.homepage && (
            <a
              href={asset.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Official Website
            </a>
          )}
          {asset.blockchain_site && (
            <a
              href={asset.blockchain_site}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Blockchain Explorer
            </a>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      {asset.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {asset.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
