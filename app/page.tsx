'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { NavHeader } from '@/components/nav-header'
import { AssetCard } from '@/components/asset-card'
import { AssetCardSkeleton } from '@/components/asset-card-skeleton'
import { ErrorState } from '@/components/error-state'
import { SearchBar } from '@/components/search-bar'
import {
  FilterBar,
  type SortOption,
  type FilterOption,
} from '@/components/filter-bar'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import type { CryptoAsset, Favorite } from '@/lib/types'

export default function Home() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const perPage = 20

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [filter, setFilter] = useState<FilterOption>('all')

  // Debounced search to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch initial assets and favorites in parallel
      const [assetsRes, favoritesRes] = await Promise.all([
        fetch(`/api/assets?page=1&per_page=${perPage}`),
        fetch('/api/favorites'),
      ])

      if (!assetsRes.ok || !favoritesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const assetsData = await assetsRes.json()
      const favoritesData = await favoritesRes.json()

      setAssets(assetsData.assets || [])
      setHasMore(assetsData.hasMore ?? true)
      setFavorites(
        favoritesData.favorites?.map((f: Favorite) => f.asset_id) || []
      )
    } catch (err) {
      setError('Failed to load cryptocurrency data. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreAssets = useCallback(async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const nextPage = page + 1

      const response = await fetch(
        `/api/assets?page=${nextPage}&per_page=${perPage}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch more assets')
      }

      const data = await response.json()

      if (data.assets && data.assets.length > 0) {
        setAssets((prev) => [...prev, ...data.assets])
        setPage(nextPage)
        setHasMore(data.hasMore ?? false)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more assets:', err)
      toast.error('Failed to load more cryptocurrencies')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, perPage])

  // Infinite scroll observer
  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMoreAssets,
    hasMore,
    isLoading: loadingMore,
  })

  const toggleFavorite = async (assetId: string) => {
    const isFavorite = favorites.includes(assetId)
    setFavoriteLoading(assetId)

    try {
      if (isFavorite) {
        // Remove from favorites
        const res = await fetch(`/api/favorites?asset_id=${assetId}`, {
          method: 'DELETE',
        })

        if (!res.ok) throw new Error('Failed to remove favorite')

        setFavorites((prev) => prev.filter((id) => id !== assetId))
        toast.success('Removed from favorites')
      } else {
        // Add to favorites
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset_id: assetId }),
        })

        if (!res.ok) throw new Error('Failed to add favorite')

        setFavorites((prev) => [...prev, assetId])
        toast.success('Added to favorites')
      }
    } catch (err) {
      toast.error('Failed to update favorites')
      console.error(err)
    } finally {
      setFavoriteLoading(null)
    }
  }

  // Filter, search, and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = [...assets]

    // Apply search filter (using debounced value for better performance)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(term) ||
          asset.symbol.toLowerCase().includes(term)
      )
    }

    // Apply gainers/losers filter
    if (filter === 'gainers') {
      filtered = filtered.filter(
        (asset) => asset.price_change_percentage_24h >= 0
      )
    } else if (filter === 'losers') {
      filtered = filtered.filter(
        (asset) => asset.price_change_percentage_24h < 0
      )
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.current_price - b.current_price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.current_price - a.current_price)
    } else if (sortBy === 'change-asc') {
      filtered.sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      )
    } else if (sortBy === 'change-desc') {
      filtered.sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      )
    }
    // 'default' keeps market cap order from API

    return filtered
  }, [assets, debouncedSearchTerm, filter, sortBy])

  if (loading) {
    return (
      <>
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-muted rounded-md animate-pulse mb-2" />
            <div className="h-5 w-48 bg-muted rounded-md animate-pulse" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
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
            title="Failed to Load"
            message={error}
            onRetry={fetchInitialData}
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
            Cryptocurrency Explorer
          </h1>
          <p className="text-muted-foreground">
            Top cryptocurrencies by market cap
          </p>
          <div className="mt-4">
            <Link href="/favorites">
              <Button variant="outline">
                View Favorites ({favorites.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or symbol..."
          />
          <FilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Assets Grid */}
        {filteredAssets.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No results found</EmptyTitle>
              <EmptyDescription>
                {debouncedSearchTerm
                  ? `No cryptocurrencies match "${debouncedSearchTerm}"`
                  : 'No cryptocurrencies match your filters'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isFavorite={favorites.includes(asset.id)}
                  onToggleFavorite={toggleFavorite}
                  isLoading={favoriteLoading === asset.id}
                />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore &&
              !debouncedSearchTerm &&
              filter === 'all' &&
              sortBy === 'default' && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  {/* Invisible trigger for intersection observer */}
                  <div
                    ref={observerTarget}
                    className="h-4"
                  />

                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more cryptocurrencies...</span>
                    </div>
                  )}

                  {/* Manual load more button as fallback */}
                  {!loadingMore && (
                    <Button
                      onClick={loadMoreAssets}
                      variant="outline"
                      disabled={loadingMore}
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}

            {/* Show total count */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {filteredAssets.length} cryptocurrencies
            </div>
          </>
        )}
      </div>
    </>
  )
}
