'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CryptoAsset } from '@/lib/types'
import { formatPrice, formatPercentage, getPercentageColor } from '@/lib/utils'

interface AssetCardProps {
  asset: CryptoAsset
  isFavorite: boolean
  onToggleFavorite: (assetId: string) => void
  isLoading?: boolean
}

function AssetCardComponent({
  asset,
  isFavorite,
  onToggleFavorite,
  isLoading = false,
}: AssetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow relative">
        <Link
          href={`/assets/${asset.id}`}
          className="block"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Asset Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <Image
                    src={asset.image}
                    alt={asset.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {asset.name}
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase">
                    {asset.symbol}
                  </p>
                </div>
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite(asset.id)
                }}
                disabled={isLoading}
                className="flex-shrink-0 relative z-10"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
              </Button>
            </div>

            {/* Price Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold">
                  {formatPrice(asset.current_price)}
                </span>
              </div>

              <Badge
                variant="secondary"
                className={`${getPercentageColor(
                  asset.price_change_percentage_24h
                )} font-semibold`}
              >
                {formatPercentage(asset.price_change_percentage_24h)} 24h
              </Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}

// Memoize to prevent unnecessary re-renders
export const AssetCard = memo(AssetCardComponent)
