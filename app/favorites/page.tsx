'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NavHeader } from '@/components/nav-header'
import { AssetCard } from '@/components/asset-card'
import { AssetCardSkeleton } from '@/components/asset-card-skeleton'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { toast } from 'sonner'
import type { CryptoAsset, Favorite } from '@/lib/types'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch favorites first
      const favoritesRes = await fetch('/api/favorites')
      if (!favoritesRes.ok) throw new Error('Failed to fetch favorites')

      const favoritesData = await favoritesRes.json()
      const favorites: Favorite[] = favoritesData.favorites || []
      const ids = favorites.map((f) => f.asset_id)

      if (ids.length === 0) {
        setAssets([])
        setLoading(false)
        return
      }

      // Fetch all assets to get details
      const assetsRes = await fetch('/api/assets')
      if (!assetsRes.ok) throw new Error('Failed to fetch assets')

      const assetsData = await assetsRes.json()
      const allAssets: CryptoAsset[] = assetsData.assets || []

      // Filter to only favorite assets
      const favoriteAssets = allAssets.filter((asset) => ids.includes(asset.id))
      setAssets(favoriteAssets)
    } catch (err) {
      setError('Failed to load favorites. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (assetId: string) => {
    setFavoriteLoading(assetId)

    try {
      const res = await fetch(`/api/favorites?asset_id=${assetId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to remove favorite')

      setAssets((prev) => prev.filter((asset) => asset.id !== assetId))
      toast.success('Removed from favorites')
    } catch (err) {
      toast.error('Failed to remove favorite')
      console.error(err)
    } finally {
      setFavoriteLoading(null)
    }
  }

  if (loading) {
    return (
      <>
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-48 bg-muted rounded-md animate-pulse mb-2" />
            <div className="h-5 w-32 bg-muted rounded-md animate-pulse" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            title="Failed to Load Favorites"
            message={error}
            onRetry={fetchData}
            retrying={loading}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Your Favorites
          </h1>
          <p className="text-muted-foreground">
            {assets.length} favorite{assets.length !== 1 ? 's' : ''}
          </p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline">Back to Explorer</Button>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {assets.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Heart className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No favorites yet</EmptyTitle>
              <EmptyDescription>
                Start adding cryptocurrencies to your favorites from the
                explorer.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/">
                <Button>Explore Cryptocurrencies</Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isFavorite={true}
                onToggleFavorite={removeFavorite}
                isLoading={favoriteLoading === asset.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
