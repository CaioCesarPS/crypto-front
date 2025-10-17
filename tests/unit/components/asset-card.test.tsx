import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssetCard } from '@/components/asset-card'
import type { CryptoAsset } from '@/lib/types'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      {...props}
    />
  ),
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
}))

describe('AssetCard Component', () => {
  const mockAsset: CryptoAsset = {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    image: 'https://example.com/bitcoin.png',
    current_price: 45000.5,
    price_change_percentage_24h: 5.25,
    market_cap: 850000000000,
    total_volume: 35000000000,
  }

  const mockOnToggleFavorite = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render asset information correctly', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByAltText('Bitcoin')).toBeInTheDocument()
      expect(screen.getByText(/\$45,000\.50/)).toBeInTheDocument()
    })

    it('should display formatted price correctly', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const price = screen.getByText(/\$45,000\.50/)
      expect(price).toBeInTheDocument()
    })

    it('should display price change percentage with correct formatting', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText(/5\.25%/)).toBeInTheDocument()
      expect(screen.getByText(/24h/)).toBeInTheDocument()
    })

    it('should render negative price change correctly', () => {
      const assetWithNegativeChange = {
        ...mockAsset,
        price_change_percentage_24h: -3.45,
      }

      render(
        <AssetCard
          asset={assetWithNegativeChange}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText(/-3\.45%/)).toBeInTheDocument()
    })

    it('should render asset image with correct src and alt', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const image = screen.getByAltText('Bitcoin')
      expect(image).toHaveAttribute('src', mockAsset.image)
    })
  })

  describe('Favorite Functionality', () => {
    it('should render heart icon in unfilled state when not favorite', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button')
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).toHaveClass('text-gray-400')
      expect(heartIcon).not.toHaveClass('fill-red-500')
    })

    it('should render heart icon in filled state when is favorite', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={true}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button')
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).toHaveClass('fill-red-500')
      expect(heartIcon).toHaveClass('text-red-500')
    })

    it('should call onToggleFavorite when favorite button is clicked', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button')
      fireEvent.click(favoriteButton)

      expect(mockOnToggleFavorite).toHaveBeenCalledTimes(1)
      expect(mockOnToggleFavorite).toHaveBeenCalledWith('bitcoin')
    })

    it('should prevent navigation when favorite button is clicked', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button')

      // Click the favorite button
      const clickEvent = new MouseEvent('click', { bubbles: true })
      favoriteButton.dispatchEvent(clickEvent)

      expect(mockOnToggleFavorite).toHaveBeenCalled()
    })

    it('should disable favorite button when isLoading is true', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          isLoading={true}
        />
      )

      const favoriteButton = screen.getByRole('button')
      expect(favoriteButton).toBeDisabled()
    })

    it('should not call onToggleFavorite when button is disabled', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          isLoading={true}
        />
      )

      const favoriteButton = screen.getByRole('button')
      fireEvent.click(favoriteButton)

      expect(mockOnToggleFavorite).not.toHaveBeenCalled()
    })
  })

  describe('Navigation', () => {
    it('should have correct link to asset detail page', () => {
      const { container } = render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/assets/bitcoin')
    })

    it('should render link with block display', () => {
      const { container } = render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const link = container.querySelector('a')
      expect(link).toHaveClass('block')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large price values', () => {
      const assetWithLargePrice = {
        ...mockAsset,
        current_price: 1234567890.99,
      }

      render(
        <AssetCard
          asset={assetWithLargePrice}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText(/\$1,234,567,890\.99/)).toBeInTheDocument()
    })

    it('should handle very small price values', () => {
      const assetWithSmallPrice = {
        ...mockAsset,
        current_price: 0.000123,
      }

      render(
        <AssetCard
          asset={assetWithSmallPrice}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText(/\$0\.00012/)).toBeInTheDocument()
    })

    it('should handle zero price change', () => {
      const assetWithZeroChange = {
        ...mockAsset,
        price_change_percentage_24h: 0,
      }

      render(
        <AssetCard
          asset={assetWithZeroChange}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(screen.getByText(/0\.00%/)).toBeInTheDocument()
    })

    it('should handle very long asset names', () => {
      const assetWithLongName = {
        ...mockAsset,
        name: 'Very Long Cryptocurrency Name That Should Truncate',
      }

      render(
        <AssetCard
          asset={assetWithLongName}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      expect(
        screen.getByText('Very Long Cryptocurrency Name That Should Truncate')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button for favorite toggle', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const favoriteButton = screen.getByRole('button')
      expect(favoriteButton).toBeInTheDocument()
    })

    it('should have accessible link for navigation', () => {
      render(
        <AssetCard
          asset={mockAsset}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/assets/bitcoin')
    })
  })
})
