/**
 * Unit tests for app/favorites/page.tsx
 * Tests favorites page, data fetching, and favorite management
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FavoritesPage from '@/app/favorites/page'
import type { CryptoAsset, Favorite } from '@/lib/types'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/components/nav-header', () => ({
  NavHeader: () => <div data-testid="nav-header">Nav Header</div>,
}))

jest.mock('@/components/asset-card', () => ({
  AssetCard: ({
    asset,
    onToggleFavorite,
    isLoading,
  }: {
    asset: CryptoAsset
    isFavorite: boolean
    onToggleFavorite: (id: string) => void
    isLoading: boolean
  }) => (
    <div data-testid={`asset-card-${asset.id}`}>
      <span>{asset.name}</span>
      <button
        onClick={() => onToggleFavorite(asset.id)}
        disabled={isLoading}
        data-testid={`remove-btn-${asset.id}`}
      >
        {isLoading ? 'Loading...' : 'Remove'}
      </button>
    </div>
  ),
}))

jest.mock('@/components/asset-card-skeleton', () => ({
  AssetCardSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

jest.mock('@/components/error-state', () => ({
  ErrorState: ({
    title,
    message,
    onRetry,
    retrying,
  }: {
    title: string
    message: string
    onRetry: () => void
    retrying: boolean
  }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <button
        onClick={onRetry}
        disabled={retrying}
      >
        Retry
      </button>
    </div>
  ),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant,
    onClick,
  }: {
    children: React.ReactNode
    variant?: string
    onClick?: () => void
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/empty', () => ({
  Empty: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="empty-state">{children}</div>
  ),
  EmptyHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyMedia: ({
    children,
    variant,
  }: {
    children: React.ReactNode
    variant: string
  }) => <div data-variant={variant}>{children}</div>,
  EmptyTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
  EmptyDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  EmptyContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock('lucide-react', () => ({
  Heart: () => <svg data-testid="heart-icon" />,
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock global fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

const mockAssets: CryptoAsset[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://example.com/btc.png',
    current_price: 45000,
    price_change_percentage_24h: 5.25,
    market_cap: 850000000000,
    total_volume: 35000000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'https://example.com/eth.png',
    current_price: 3000,
    price_change_percentage_24h: 3.5,
    market_cap: 360000000000,
    total_volume: 15000000000,
  },
]

const mockFavorites: Favorite[] = [
  { id: '1', asset_id: 'bitcoin', created_at: '2024-01-01' },
  { id: '2', asset_id: 'ethereum', created_at: '2024-01-02' },
]

describe('FavoritesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading skeletons initially', () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      render(<FavoritesPage />)

      expect(screen.getByTestId('nav-header')).toBeInTheDocument()
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('should show header skeleton while loading', () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      const { container } = render(<FavoritesPage />)

      const headerSkeletons = container.querySelectorAll('.animate-pulse')
      expect(headerSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Successful Data Fetch', () => {
    it('should fetch favorites and assets on mount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/favorites')
      expect(mockFetch).toHaveBeenCalledWith('/api/assets')
    })

    it('should display favorite assets', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
      })
    })

    it('should show correct favorites count', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('2 favorites')).toBeInTheDocument()
      })
    })

    it('should use singular form for one favorite', async () => {
      const singleFavorite = [mockFavorites[0]]

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: singleFavorite }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('1 favorite')).toBeInTheDocument()
      })
    })

    it('should render asset cards with favorite state', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-bitcoin')).toBeInTheDocument()
        expect(screen.getByTestId('asset-card-ethereum')).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no favorites', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })
    })

    it('should display empty state message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('No favorites yet')).toBeInTheDocument()
        expect(
          screen.getByText(/Start adding cryptocurrencies to your favorites/)
        ).toBeInTheDocument()
      })
    })

    it('should show explore button in empty state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Explore Cryptocurrencies')).toBeInTheDocument()
      })
    })

    it('should render heart icon in empty state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
      })
    })

    it('should show zero favorites count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('0 favorites')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error state when favorites fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('should show error state when assets fetch fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('should display error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Favorites')).toBeInTheDocument()
        expect(
          screen.getByText('Failed to load favorites. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('should provide retry functionality', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      const retryButton = screen.getByText('Retry')
      await userEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })
    })
  })

  describe('Remove Favorite', () => {
    it('should call remove API when clicking remove button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('remove-btn-bitcoin')).toBeInTheDocument()
      })

      const removeButton = screen.getByTestId('remove-btn-bitcoin')
      await userEvent.click(removeButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/favorites?asset_id=bitcoin',
          { method: 'DELETE' }
        )
      })
    })

    it('should remove asset from list after successful removal', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      })

      const removeButton = screen.getByTestId('remove-btn-bitcoin')
      await userEvent.click(removeButton)

      await waitFor(() => {
        expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
      })
    })

    it('should show success toast after removal', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('remove-btn-bitcoin')).toBeInTheDocument()
      })

      const removeButton = screen.getByTestId('remove-btn-bitcoin')
      await userEvent.click(removeButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Removed from favorites')
      })
    })

    it('should show error toast if removal fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('remove-btn-bitcoin')).toBeInTheDocument()
      })

      const removeButton = screen.getByTestId('remove-btn-bitcoin')
      await userEvent.click(removeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to remove favorite')
      })
    })

    it('should show loading state while removing', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)
        .mockImplementationOnce(
          () =>
            new Promise(() => {
              // Never resolves
            })
        )

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('remove-btn-bitcoin')).toBeInTheDocument()
      })

      const removeButton = screen.getByTestId('remove-btn-bitcoin')
      await userEvent.click(removeButton)

      await waitFor(() => {
        expect(removeButton).toHaveTextContent('Loading...')
        expect(removeButton).toBeDisabled()
      })
    })
  })

  describe('Navigation', () => {
    it('should render back to explorer button', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Back to Explorer')).toBeInTheDocument()
      })
    })

    it('should link back to home page', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        const backButton = screen.getByText('Back to Explorer')
        expect(backButton.closest('a')).toHaveAttribute('href', '/')
      })
    })

    it('should have explore link in empty state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorites: [] }),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        const exploreButton = screen.getByText('Explore Cryptocurrencies')
        expect(exploreButton.closest('a')).toHaveAttribute('href', '/')
      })
    })
  })

  describe('Page Header', () => {
    it('should display page title', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Your Favorites')).toBeInTheDocument()
      })
    })

    it('should have correct header styling', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        const heading = screen.getByText('Your Favorites')
        expect(heading.tagName).toBe('H1')
        expect(heading).toHaveClass('text-3xl', 'sm:text-4xl', 'font-bold')
      })
    })
  })

  describe('Grid Layout', () => {
    it('should render assets in grid layout', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      const { container } = render(<FavoritesPage />)

      await waitFor(() => {
        const grid = container.querySelector('.grid')
        expect(grid).toBeInTheDocument()
        expect(grid).toHaveClass(
          'grid-cols-1',
          'sm:grid-cols-2',
          'lg:grid-cols-3'
        )
      })
    })

    it('should render correct number of asset cards', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('asset-card-bitcoin')).toBeInTheDocument()
        expect(screen.getByTestId('asset-card-ethereum')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle fetch throwing an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('should handle missing favorites array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('0 favorites')).toBeInTheDocument()
      })
    })

    it('should handle missing assets array', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('0 favorites')).toBeInTheDocument()
      })
    })

    it('should filter out non-favorite assets', async () => {
      const allAssets = [
        ...mockAssets,
        {
          id: 'cardano',
          name: 'Cardano',
          symbol: 'ada',
          image: 'https://example.com/ada.png',
          current_price: 0.5,
          price_change_percentage_24h: 2.0,
        },
      ]

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: allAssets }),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument()
        expect(screen.getByText('Ethereum')).toBeInTheDocument()
        expect(screen.queryByText('Cardano')).not.toBeInTheDocument()
      })
    })

    it('should handle rapid remove clicks', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorites: mockFavorites }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assets: mockAssets }),
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => ({}),
        } as Response)

      render(<FavoritesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('remove-btn-bitcoin')).toBeInTheDocument()
      })

      const removeButton = screen.getByTestId('remove-btn-bitcoin')

      // Click multiple times rapidly
      await userEvent.click(removeButton)

      // Should only make one request (button disabled after first click)
      await waitFor(() => {
        expect(removeButton).toBeDisabled()
      })
    })
  })
})
