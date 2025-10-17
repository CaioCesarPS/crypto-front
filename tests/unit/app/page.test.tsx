/**
 * Unit tests for app/page.tsx
 * Tests home page component, asset fetching, favorites, search, and filtering
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'
import { toast } from 'sonner'

// Mock components
jest.mock('@/components/nav-header', () => ({
  NavHeader: () => <div data-testid="nav-header">Nav Header</div>,
}))

jest.mock('@/components/asset-card', () => ({
  AssetCard: ({
    asset,
    isFavorite,
    onToggleFavorite,
    isLoading,
  }: {
    asset: { id: string; name: string }
    isFavorite: boolean
    onToggleFavorite: (id: string) => void
    isLoading: boolean
  }) => (
    <div data-testid={`asset-card-${asset.id}`}>
      <span>{asset.name}</span>
      <button
        onClick={() => onToggleFavorite(asset.id)}
        disabled={isLoading}
        data-testid={`favorite-btn-${asset.id}`}
      >
        {isFavorite ? 'Remove' : 'Add'}
      </button>
    </div>
  ),
}))

jest.mock('@/components/asset-card-skeleton', () => ({
  AssetCardSkeleton: () => (
    <div data-testid="asset-card-skeleton">Loading...</div>
  ),
}))

jest.mock('@/components/error-state', () => ({
  ErrorState: ({
    title,
    message,
    onRetry,
  }: {
    title: string
    message: string
    onRetry: () => void
  }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}))

jest.mock('@/components/search-bar', () => ({
  SearchBar: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (value: string) => void
    placeholder: string
  }) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}))

jest.mock('@/components/filter-bar', () => ({
  FilterBar: ({
    sortBy,
    onSortChange,
    filter,
    onFilterChange,
  }: {
    sortBy: string
    onSortChange: (value: string) => void
    filter: string
    onFilterChange: (value: string) => void
  }) => (
    <div data-testid="filter-bar">
      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="default">Default</option>
        <option value="price-asc">Price Low to High</option>
        <option value="price-desc">Price High to Low</option>
        <option value="change-asc">Change Low to High</option>
        <option value="change-desc">Change High to Low</option>
      </select>
      <select
        data-testid="filter-select"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="gainers">Gainers</option>
        <option value="losers">Losers</option>
      </select>
    </div>
  ),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock hooks
jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}))

jest.mock('@/hooks/use-infinite-scroll', () => ({
  useInfiniteScroll: () => ({ current: null }),
}))

// Mock fetch
global.fetch = jest.fn()

const mockAssets = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://example.com/bitcoin.png',
    current_price: 45000,
    price_change_percentage_24h: 5.25,
    market_cap: 850000000000,
    total_volume: 35000000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'https://example.com/ethereum.png',
    current_price: 3000,
    price_change_percentage_24h: -2.5,
    market_cap: 360000000000,
    total_volume: 20000000000,
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ada',
    image: 'https://example.com/cardano.png',
    current_price: 0.5,
    price_change_percentage_24h: 3.1,
    market_cap: 17000000000,
    total_volume: 1000000000,
  },
]

const mockFavorites = [
  { id: '1', asset_id: 'bitcoin', created_at: '2024-01-01T00:00:00Z' },
]

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial Loading State', () => {
    it('should show loading skeletons initially', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )

      render(<Home />)

      expect(screen.getByTestId('nav-header')).toBeInTheDocument()

      const skeletons = screen.getAllByTestId('asset-card-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Successful Data Fetching', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: true,
              page: 1,
              perPage: 20,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: mockFavorites }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should fetch and display assets on mount', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      expect(screen.getByText('Ethereum')).toBeInTheDocument()
      expect(screen.getByText('Cardano')).toBeInTheDocument()
    })

    it('should mark favorited assets correctly', async () => {
      render(<Home />)

      await waitFor(() => {
        const bitcoinFavoriteBtn = screen.getByTestId('favorite-btn-bitcoin')
        expect(bitcoinFavoriteBtn).toHaveTextContent('Remove')
      })

      const ethereumFavoriteBtn = screen.getByTestId('favorite-btn-ethereum')
      expect(ethereumFavoriteBtn).toHaveTextContent('Add')
    })

    it('should display page header and title', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Cryptocurrency Explorer')).toBeInTheDocument()
      })

      expect(
        screen.getByText('Top cryptocurrencies by market cap')
      ).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      expect(screen.getByText('Failed to Load')).toBeInTheDocument()
    })

    it('should display error state when response is not ok', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('should retry fetching data when retry button is clicked', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockImplementation((url: string) => {
          if (url.includes('/api/assets')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                assets: mockAssets,
                hasMore: false,
              }),
            })
          }
          if (url.includes('/api/favorites')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ favorites: [] }),
            })
          }
          return Promise.reject(new Error('Unknown URL'))
        })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should filter assets by name', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-bar')
      await userEvent.type(searchInput, 'bitcoin')

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
        expect(screen.queryByText('Ethereum')).not.toBeInTheDocument()
        expect(screen.queryByText('Cardano')).not.toBeInTheDocument()
      })
    })

    it('should filter assets by symbol', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-bar')
      await userEvent.type(searchInput, 'eth')

      await waitFor(() => {
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
        expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
      })
    })

    it('should show empty state when no results match search', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-bar')
      await userEvent.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
    })

    it('should be case-insensitive', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-bar')
      await userEvent.type(searchInput, 'BITCOIN')

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })
    })
  })

  describe('Filter Functionality', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should filter gainers (positive change)', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const filterSelect = screen.getByTestId('filter-select')
      await userEvent.selectOptions(filterSelect, 'gainers')

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument() // +5.25%
        expect(screen.getByText('Cardano')).toBeInTheDocument() // +3.1%
        expect(screen.queryByText('Ethereum')).not.toBeInTheDocument() // -2.5%
      })
    })

    it('should filter losers (negative change)', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
      })

      const filterSelect = screen.getByTestId('filter-select')
      await userEvent.selectOptions(filterSelect, 'losers')

      await waitFor(() => {
        expect(screen.getByText('Ethereum')).toBeInTheDocument() // -2.5%
        expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
        expect(screen.queryByText('Cardano')).not.toBeInTheDocument()
      })
    })

    it('should show all assets when filter is "all"', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const filterSelect = screen.getByTestId('filter-select')
      await userEvent.selectOptions(filterSelect, 'all')

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
        expect(screen.getByText('Cardano')).toBeInTheDocument()
      })
    })
  })

  describe('Sort Functionality', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should sort by price ascending', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      await userEvent.selectOptions(sortSelect, 'price-asc')

      await waitFor(() => {
        const cards = screen.getAllByTestId(/asset-card-/)
        // Cardano (0.5), Ethereum (3000), Bitcoin (45000)
        expect(cards[0]).toHaveAttribute('data-testid', 'asset-card-cardano')
        expect(cards[1]).toHaveAttribute('data-testid', 'asset-card-ethereum')
        expect(cards[2]).toHaveAttribute('data-testid', 'asset-card-bitcoin')
      })
    })

    it('should sort by price descending', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      await userEvent.selectOptions(sortSelect, 'price-desc')

      await waitFor(() => {
        const cards = screen.getAllByTestId(/asset-card-/)
        // Bitcoin (45000), Ethereum (3000), Cardano (0.5)
        expect(cards[0]).toHaveAttribute('data-testid', 'asset-card-bitcoin')
        expect(cards[1]).toHaveAttribute('data-testid', 'asset-card-ethereum')
        expect(cards[2]).toHaveAttribute('data-testid', 'asset-card-cardano')
      })
    })

    it('should sort by change ascending', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      await userEvent.selectOptions(sortSelect, 'change-asc')

      await waitFor(() => {
        const cards = screen.getAllByTestId(/asset-card-/)
        // Ethereum (-2.5%), Cardano (3.1%), Bitcoin (5.25%)
        expect(cards[0]).toHaveAttribute('data-testid', 'asset-card-ethereum')
        expect(cards[1]).toHaveAttribute('data-testid', 'asset-card-cardano')
        expect(cards[2]).toHaveAttribute('data-testid', 'asset-card-bitcoin')
      })
    })

    it('should sort by change descending', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      await userEvent.selectOptions(sortSelect, 'change-desc')

      await waitFor(() => {
        const cards = screen.getAllByTestId(/asset-card-/)
        // Bitcoin (5.25%), Cardano (3.1%), Ethereum (-2.5%)
        expect(cards[0]).toHaveAttribute('data-testid', 'asset-card-bitcoin')
        expect(cards[1]).toHaveAttribute('data-testid', 'asset-card-cardano')
        expect(cards[2]).toHaveAttribute('data-testid', 'asset-card-ethereum')
      })
    })
  })

  describe('Favorites Management', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should add asset to favorites', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        (url: string, options) => {
          if (url.includes('/api/assets')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ assets: mockAssets, hasMore: false }),
            })
          }
          if (url.includes('/api/favorites') && options?.method === 'POST') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ success: true }),
            })
          }
          if (url.includes('/api/favorites')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ favorites: [] }),
            })
          }
          return Promise.reject(new Error('Unknown URL'))
        }
      )

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByTestId('favorite-btn-bitcoin')).toBeInTheDocument()
      })

      const favoriteBtn = screen.getByTestId('favorite-btn-bitcoin')
      fireEvent.click(favoriteBtn)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Added to favorites')
      })

      // Verify the button state changed to "Remove"
      await waitFor(() => {
        expect(favoriteBtn).toHaveTextContent('Remove')
      })
    })

    it('should remove asset from favorites', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        (url: string, options) => {
          if (url.includes('/api/assets')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ assets: mockAssets, hasMore: false }),
            })
          }
          if (url.includes('/api/favorites') && options?.method === 'DELETE') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ success: true }),
            })
          }
          if (url.includes('/api/favorites')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ favorites: mockFavorites }),
            })
          }
          return Promise.reject(new Error('Unknown URL'))
        }
      )

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByTestId('favorite-btn-bitcoin')).toBeInTheDocument()
      })

      const favoriteBtn = screen.getByTestId('favorite-btn-bitcoin')
      fireEvent.click(favoriteBtn)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Removed from favorites')
      })

      // Verify the button state changed to "Add"
      await waitFor(() => {
        expect(favoriteBtn).toHaveTextContent('Add')
      })
    })

    it('should show error toast when adding favorite fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        (url: string, options) => {
          if (url.includes('/api/assets')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ assets: mockAssets, hasMore: false }),
            })
          }
          if (url.includes('/api/favorites') && options?.method === 'POST') {
            return Promise.resolve({
              ok: false,
              status: 500,
            })
          }
          if (url.includes('/api/favorites')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ favorites: [] }),
            })
          }
          return Promise.reject(new Error('Unknown URL'))
        }
      )

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByTestId('favorite-btn-bitcoin')).toBeInTheDocument()
      })

      const favoriteBtn = screen.getByTestId('favorite-btn-bitcoin')
      fireEvent.click(favoriteBtn)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update favorites')
      })
    })
  })

  describe('Infinite Scroll', () => {
    it('should load more assets when scrolling', async () => {
      const page2Assets = [
        {
          id: 'ripple',
          name: 'Ripple',
          symbol: 'xrp',
          image: 'https://example.com/ripple.png',
          current_price: 1.2,
          price_change_percentage_24h: 1.5,
          market_cap: 50000000000,
          total_volume: 5000000000,
        },
      ]

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets?page=1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: true,
            }),
          })
        }
        if (url.includes('/api/assets?page=2')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: page2Assets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      // Find and click the Load More button
      const loadMoreBtn = screen.getByText('Load More')
      fireEvent.click(loadMoreBtn)

      await waitFor(() => {
        expect(screen.getByText('Ripple')).toBeInTheDocument()
      })
    })

    it('should show error toast when loading more fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets?page=1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: true,
            }),
          })
        }
        if (url.includes('/api/assets?page=2')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const loadMoreBtn = screen.getByText('Load More')
      fireEvent.click(loadMoreBtn)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load more cryptocurrencies'
        )
      })
    })

    it('should not load more when already loading', async () => {
      let page2Calls = 0
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets?page=1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: true,
            }),
          })
        }
        if (url.includes('/api/assets?page=2')) {
          page2Calls++
          return new Promise(() => {}) // Never resolves
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const loadMoreBtn = screen.getByText('Load More')

      // Click once and wait for loading state
      fireEvent.click(loadMoreBtn)

      await waitFor(() => {
        expect(
          screen.getByText('Loading more cryptocurrencies...')
        ).toBeInTheDocument()
      })

      // Try to click again while loading - should not trigger another request
      // The button should not be visible or the function should return early
      const loadingBtn = screen.queryByText('Load More')
      if (loadingBtn) {
        fireEvent.click(loadingBtn)
      }

      // Should only make one request to page 2
      expect(page2Calls).toBe(1)
    })

    it('should not load more when hasMore is false', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      // Load More button should not be visible when hasMore is false
      expect(screen.queryByText('Load More')).not.toBeInTheDocument()
    })
  })

  describe('Display Information', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should display total count of cryptocurrencies', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(
          screen.getByText('Showing 3 cryptocurrencies')
        ).toBeInTheDocument()
      })
    })

    it('should update count after filtering', async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const filterSelect = screen.getByTestId('filter-select')
      await userEvent.selectOptions(filterSelect, 'losers')

      await waitFor(() => {
        expect(
          screen.getByText('Showing 1 cryptocurrencies')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty assets response', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: [],
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
    })

    it('should handle null hasMore in response', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: null,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      // Should default to true when hasMore is null
      expect(screen.getByText('Load More')).toBeInTheDocument()
    })

    it('should handle empty string in search', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/assets')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: mockAssets,
              hasMore: false,
            }),
          })
        }
        if (url.includes('/api/favorites')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ favorites: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-bar')
      await userEvent.type(searchInput, 'test')
      await userEvent.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
        expect(screen.getByText('Cardano')).toBeInTheDocument()
      })
    })
  })
})
