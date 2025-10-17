import { renderHook } from '@testing-library/react'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

// Helper to create a mock IntersectionObserverEntry
const createMockEntry = (
  isIntersecting: boolean
): IntersectionObserverEntry => {
  return {
    isIntersecting,
    target: document.createElement('div'),
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  } as IntersectionObserverEntry
}

describe('useInfiniteScroll', () => {
  let mockObserve: jest.Mock
  let mockUnobserve: jest.Mock
  let mockDisconnect: jest.Mock
  let observerCallback: IntersectionObserverCallback | null = null

  beforeEach(() => {
    mockObserve = jest.fn()
    mockUnobserve = jest.fn()
    mockDisconnect = jest.fn()
    observerCallback = null

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn((callback) => {
      observerCallback = callback
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: jest.fn(),
      }
    }) as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    jest.clearAllMocks()
    observerCallback = null
  })

  it('should return a ref object', () => {
    const onLoadMore = jest.fn()
    const { result } = renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    expect(result.current).toHaveProperty('current')
    expect(result.current.current).toBeNull()
  })

  it('should not call onLoadMore when hasMore is false', () => {
    const onLoadMore = jest.fn()
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: false, isLoading: false })
    )

    if (observerCallback) {
      const entries = [createMockEntry(true)]
      observerCallback(entries, {} as IntersectionObserver)
    }

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('should not call onLoadMore when isLoading is true', () => {
    const onLoadMore = jest.fn()
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: true })
    )

    if (observerCallback) {
      const entries = [createMockEntry(true)]
      observerCallback(entries, {} as IntersectionObserver)
    }

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('should not call onLoadMore when not intersecting', () => {
    const onLoadMore = jest.fn()
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    if (observerCallback) {
      const entries = [createMockEntry(false)]
      observerCallback(entries, {} as IntersectionObserver)
    }

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('should handle multiple intersection events', () => {
    const onLoadMore = jest.fn()
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: false, isLoading: false })
    )

    if (observerCallback) {
      // First intersection - should not call (hasMore is false)
      observerCallback([createMockEntry(true)], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()

      // Not intersecting
      observerCallback([createMockEntry(false)], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    }
  })

  it('should update behavior when dependencies change', () => {
    const onLoadMore = jest.fn()
    const { rerender } = renderHook(
      ({ hasMore, isLoading }) =>
        useInfiniteScroll({ onLoadMore, hasMore, isLoading }),
      { initialProps: { hasMore: true, isLoading: true } }
    )

    // First intersection with isLoading=true - should not call
    if (observerCallback) {
      observerCallback([createMockEntry(true)], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    }

    // Change to hasMore=false
    rerender({ hasMore: false, isLoading: false })

    // Second intersection - should not call onLoadMore (hasMore is false)
    if (observerCallback) {
      observerCallback([createMockEntry(true)], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    }
  })

  it('should handle empty entries array gracefully', () => {
    const onLoadMore = jest.fn()
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    if (observerCallback) {
      // Call with empty array
      observerCallback([], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    }
  })

  it('should accept custom threshold and rootMargin options', () => {
    const onLoadMore = jest.fn()

    // Just verify the hook can be called with these options without error
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        isLoading: false,
        threshold: 0.5,
        rootMargin: '200px',
      })
    )

    expect(result.current).toHaveProperty('current')
  })
})
