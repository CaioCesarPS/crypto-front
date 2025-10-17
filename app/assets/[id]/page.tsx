'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AssetDetails } from '@/components/asset-details'
import { PriceChart } from '@/components/price-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { NavHeader } from '@/components/nav-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { AssetDetail } from '@/lib/types'

interface AssetDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const router = useRouter()
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkingFavorite, setCheckingFavorite] = useState(true)
  const [assetId, setAssetId] = useState<string>('')

  useEffect(() => {
    params.then((p) => {
      setAssetId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (!assetId) return
    fetchAssetDetails()
    checkIfFavorite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId])

  const fetchAssetDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/assets/${assetId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch asset details')
      }

      const data = await response.json()
      setAsset(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorite = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(
          data.favorites.some(
            (fav: { asset_id: string }) => fav.asset_id === assetId
          )
        )
      }
    } catch (err) {
      console.error('Failed to check favorite status:', err)
    } finally {
      setCheckingFavorite(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?asset_id=${assetId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setIsFavorite(false)
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset_id: assetId }),
        })

        if (response.ok) {
          setIsFavorite(true)
          toast.success('Added to favorites')
        }
      }
    } catch {
      toast.error('Failed to update favorites')
    }
  }

  if (loading) {
    return (
      <>
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (error || !asset) {
    return (
      <>
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <ErrorState
            message={error || 'Asset not found'}
            onRetry={fetchAssetDetails}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <AssetDetails
          asset={asset}
          isFavorite={isFavorite}
          onToggleFavorite={checkingFavorite ? undefined : handleToggleFavorite}
        />

        {/* Price Chart */}
        <div className="mt-6">
          <PriceChart
            assetId={assetId}
            assetName={asset.name}
          />
        </div>
      </div>
    </>
  )
}
