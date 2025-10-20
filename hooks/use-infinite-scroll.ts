import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  /**
   * Callback function to load more items
   */
  onLoadMore: () => void
  /**
   * Whether there are more items to load
   */
  hasMore: boolean
  /**
   * Whether currently loading
   */
  isLoading: boolean
  /**
   * Root margin for intersection observer (default: '100px')
   */
  rootMargin?: string
  /**
   * Intersection threshold (default: 0.1)
   */
  threshold?: number
}

/**
 * Custom hook for infinite scroll using Intersection Observer
 *
 * @example
 * ```tsx
 * const observerTarget = useInfiniteScroll({
 *   onLoadMore: loadMore,
 *   hasMore: hasMoreData,
 *   isLoading: loading
 * })
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={observerTarget} />
 *   </div>
 * )
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const lastLoadTime = useRef<number>(0)
  const minLoadInterval = 500 // Minimum 500ms between loads

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries

      // If target is intersecting, has more data, and not loading
      if (target && target.isIntersecting && hasMore && !isLoading) {
        const now = Date.now()
        const timeSinceLastLoad = now - lastLoadTime.current

        // Throttle: only load if enough time has passed since last load
        if (timeSinceLastLoad >= minLoadInterval) {
          lastLoadTime.current = now
          onLoadMore()
        }
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null, // viewport
      rootMargin,
      threshold,
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver, rootMargin, threshold])

  return observerTarget
}
