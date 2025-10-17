/**
 * Unit tests for components/asset-details.tsx
 * Tests asset details display, formatting, and user interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { AssetDetails } from '@/components/asset-details'
import type { AssetDetail } from '@/lib/types'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string
    alt: string
    width: number
    height: number
    className?: string
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}))

const mockAssetDetail: AssetDetail = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/bitcoin.png',
  current_price: 45000,
  market_cap: 850000000000,
  market_cap_rank: 1,
  total_volume: 35000000000,
  high_24h: 46000,
  low_24h: 44000,
  price_change_percentage_24h: 5.25,
  price_change_percentage_7d: 8.5,
  price_change_percentage_30d: 15.3,
  circulating_supply: 19000000,
  total_supply: 21000000,
  max_supply: 21000000,
  ath: 69000,
  ath_change_percentage: -34.78,
  ath_date: '2021-11-10T14:24:11.849Z',
  atl: 67.81,
  atl_change_percentage: 66279.89,
  atl_date: '2013-07-06T00:00:00.000Z',
  description:
    'Bitcoin is the first decentralized cryptocurrency. It is a digital currency that works on a peer-to-peer network. Bitcoin was created by an unknown person or group of people using the name Satoshi Nakamoto.',
  homepage: 'https://bitcoin.org',
  blockchain_site: 'https://blockchain.info',
  categories: ['Cryptocurrency', 'Store of Value', 'Layer 1'],
}

describe('AssetDetails', () => {
  describe('Header Section', () => {
    it('should render asset image', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const image = screen.getByAltText('Bitcoin')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/bitcoin.png')
      expect(image).toHaveAttribute('width', '80')
      expect(image).toHaveAttribute('height', '80')
    })

    it('should render asset name', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })

    it('should render asset symbol in uppercase', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const symbols = screen.getAllByText('BTC')
      expect(symbols.length).toBeGreaterThan(0)
    })

    it('should render market cap rank', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Rank #1')).toBeInTheDocument()
    })

    it('should render current price', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('$45,000.00')).toBeInTheDocument()
    })

    it('should render price change percentage with positive color', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('+5.25%')).toBeInTheDocument()
    })

    it('should render trending up icon for positive change', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const badge = screen.getByText('+5.25%').closest('span')
      expect(badge).toHaveClass('bg-primary')
    })

    it('should render trending down icon for negative change', () => {
      const negativeAsset = {
        ...mockAssetDetail,
        price_change_percentage_24h: -5.25,
      }
      render(<AssetDetails asset={negativeAsset} />)

      const badge = screen.getByText('-5.25%').closest('span')
      expect(badge).toHaveClass('bg-destructive')
    })
  })

  describe('Favorite Button', () => {
    it('should render favorite button when onToggleFavorite is provided', () => {
      const onToggleFavorite = jest.fn()
      render(
        <AssetDetails
          asset={mockAssetDetail}
          onToggleFavorite={onToggleFavorite}
        />
      )

      expect(screen.getByText('☆ Add to Favorites')).toBeInTheDocument()
    })

    it('should not render favorite button when onToggleFavorite is not provided', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.queryByText('☆ Add to Favorites')).not.toBeInTheDocument()
      expect(
        screen.queryByText('★ Remove from Favorites')
      ).not.toBeInTheDocument()
    })

    it('should show "Add to Favorites" when not favorited', () => {
      const onToggleFavorite = jest.fn()
      render(
        <AssetDetails
          asset={mockAssetDetail}
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
        />
      )

      expect(screen.getByText('☆ Add to Favorites')).toBeInTheDocument()
    })

    it('should show "Remove from Favorites" when favorited', () => {
      const onToggleFavorite = jest.fn()
      render(
        <AssetDetails
          asset={mockAssetDetail}
          isFavorite={true}
          onToggleFavorite={onToggleFavorite}
        />
      )

      expect(screen.getByText('★ Remove from Favorites')).toBeInTheDocument()
    })

    it('should call onToggleFavorite when clicked', () => {
      const onToggleFavorite = jest.fn()
      render(
        <AssetDetails
          asset={mockAssetDetail}
          onToggleFavorite={onToggleFavorite}
        />
      )

      const button = screen.getByText('☆ Add to Favorites')
      fireEvent.click(button)

      expect(onToggleFavorite).toHaveBeenCalledTimes(1)
    })

    it('should have correct variant when favorited', () => {
      const onToggleFavorite = jest.fn()
      render(
        <AssetDetails
          asset={mockAssetDetail}
          isFavorite={true}
          onToggleFavorite={onToggleFavorite}
        />
      )

      const button = screen.getByText('★ Remove from Favorites')
      expect(button).toHaveClass('bg-primary')
    })

    it('should have outline variant when not favorited', () => {
      const onToggleFavorite = jest.fn()
      render(
        <AssetDetails
          asset={mockAssetDetail}
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
        />
      )

      const button = screen.getByText('☆ Add to Favorites')
      expect(button).toHaveClass('border')
    })
  })

  describe('Market Stats', () => {
    it('should render market cap', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Market Cap')).toBeInTheDocument()
      expect(screen.getByText('$850,000,000,000.00')).toBeInTheDocument()
    })

    it('should render 24h volume', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('24h Volume')).toBeInTheDocument()
      expect(screen.getByText('$35,000,000,000.00')).toBeInTheDocument()
    })

    it('should render circulating supply', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Circulating Supply')).toBeInTheDocument()
      expect(screen.getByText('19M')).toBeInTheDocument()
    })

    it('should render 24h high and low', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('24h High / Low')).toBeInTheDocument()
      expect(screen.getByText('$46,000.00')).toBeInTheDocument()
      expect(screen.getByText('$44,000.00')).toBeInTheDocument()
    })

    it('should render total supply', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Total Supply')).toBeInTheDocument()
      expect(screen.getByText('21M')).toBeInTheDocument()
    })

    it('should render max supply when available', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Max: 21M')).toBeInTheDocument()
    })

    it('should not render max supply when not available', () => {
      const assetWithoutMaxSupply = {
        ...mockAssetDetail,
        max_supply: null,
      }
      render(<AssetDetails asset={assetWithoutMaxSupply} />)

      expect(screen.queryByText(/Max:/)).not.toBeInTheDocument()
    })

    it('should render price changes for 7 and 30 days', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Price Changes')).toBeInTheDocument()
      expect(screen.getByText('7 days:')).toBeInTheDocument()
      expect(screen.getByText('+8.50%')).toBeInTheDocument()
      expect(screen.getByText('30 days:')).toBeInTheDocument()
      expect(screen.getByText('+15.30%')).toBeInTheDocument()
    })
  })

  describe('Supply Formatting', () => {
    it('should format null supply as N/A', () => {
      const assetWithNullSupply = {
        ...mockAssetDetail,
        circulating_supply: null as unknown as number,
      }
      render(<AssetDetails asset={assetWithNullSupply} />)

      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should format large numbers with compact notation', () => {
      const assetWithLargeSupply = {
        ...mockAssetDetail,
        circulating_supply: 1234567890,
      }
      render(<AssetDetails asset={assetWithLargeSupply} />)

      expect(screen.getByText('1.23B')).toBeInTheDocument()
    })

    it('should format small numbers correctly', () => {
      const assetWithSmallSupply = {
        ...mockAssetDetail,
        circulating_supply: 1234,
      }
      render(<AssetDetails asset={assetWithSmallSupply} />)

      expect(screen.getByText('1.23K')).toBeInTheDocument()
    })
  })

  describe('All-Time High/Low', () => {
    it('should render all-time high', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('All-Time High')).toBeInTheDocument()
      expect(screen.getByText('$69,000.00')).toBeInTheDocument()
    })

    it('should render ATH date', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Nov 10, 2021')).toBeInTheDocument()
    })

    it('should render ATH change percentage', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('-34.78%')).toBeInTheDocument()
    })

    it('should render all-time low', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('All-Time Low')).toBeInTheDocument()
      expect(screen.getByText('$67.81')).toBeInTheDocument()
    })

    it('should render ATL date', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText(/Jul.*2013/)).toBeInTheDocument()
    })

    it('should render ATL change percentage', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText(/\+66.*279.*89%/)).toBeInTheDocument()
    })
  })

  describe('Description', () => {
    it('should render description section', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('About Bitcoin')).toBeInTheDocument()
    })

    it('should render description content', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(
        screen.getByText(/Bitcoin is the first decentralized cryptocurrency/)
      ).toBeInTheDocument()
    })

    it('should truncate description to first 3 sentences', () => {
      const longDescription =
        'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.'
      const assetWithLongDescription = {
        ...mockAssetDetail,
        description: longDescription,
      }
      render(<AssetDetails asset={assetWithLongDescription} />)

      const description = screen.getByText(/First sentence/)
      expect(description.innerHTML).toContain(
        'First sentence. Second sentence. Third sentence.'
      )
      expect(description.innerHTML).not.toContain('Fourth sentence')
    })

    it('should not render description section when description is empty', () => {
      const assetWithoutDescription = {
        ...mockAssetDetail,
        description: '',
      }
      render(<AssetDetails asset={assetWithoutDescription} />)

      expect(screen.queryByText('About Bitcoin')).not.toBeInTheDocument()
    })

    it('should not render description section when description is null', () => {
      const assetWithoutDescription = {
        ...mockAssetDetail,
        description: null as unknown as string,
      }
      render(<AssetDetails asset={assetWithoutDescription} />)

      expect(screen.queryByText('About Bitcoin')).not.toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('should render links section', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Links')).toBeInTheDocument()
    })

    it('should render official website link', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const link = screen.getByText('Official Website')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', 'https://bitcoin.org')
      expect(link.closest('a')).toHaveAttribute('target', '_blank')
      expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render blockchain explorer link', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const link = screen.getByText('Blockchain Explorer')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute(
        'href',
        'https://blockchain.info'
      )
      expect(link.closest('a')).toHaveAttribute('target', '_blank')
      expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should not render official website link when not available', () => {
      const assetWithoutHomepage = {
        ...mockAssetDetail,
        homepage: null as unknown as string,
      }
      render(<AssetDetails asset={assetWithoutHomepage} />)

      expect(screen.queryByText('Official Website')).not.toBeInTheDocument()
    })

    it('should not render blockchain explorer link when not available', () => {
      const assetWithoutBlockchainSite = {
        ...mockAssetDetail,
        blockchain_site: null as unknown as string,
      }
      render(<AssetDetails asset={assetWithoutBlockchainSite} />)

      expect(screen.queryByText('Blockchain Explorer')).not.toBeInTheDocument()
    })
  })

  describe('Categories', () => {
    it('should render categories section', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Categories')).toBeInTheDocument()
    })

    it('should render all categories', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument()
      expect(screen.getByText('Store of Value')).toBeInTheDocument()
      expect(screen.getByText('Layer 1')).toBeInTheDocument()
    })

    it('should not render categories section when empty', () => {
      const assetWithoutCategories = {
        ...mockAssetDetail,
        categories: [],
      }
      render(<AssetDetails asset={assetWithoutCategories} />)

      // The section should not be rendered
      const categoryHeaders = screen.queryAllByText('Categories')
      // Should only find the one in links, not a separate categories section
      expect(categoryHeaders.length).toBe(0)
    })

    it('should render categories as badges', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const categoryBadge = screen.getByText('Cryptocurrency').closest('span')
      expect(categoryBadge).toHaveClass('inline-flex')
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      expect(screen.getByText(/Nov.*10.*2021/)).toBeInTheDocument()
      expect(screen.getByText(/Jul.*2013/)).toBeInTheDocument()
    })
  })

  describe('Price Change Colors', () => {
    it('should apply correct color class for positive 7d change', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const change7d = screen.getByText('+8.50%')
      expect(change7d).toHaveClass('text-green-600')
    })

    it('should apply correct color class for positive 30d change', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const change30d = screen.getByText('+15.30%')
      expect(change30d).toHaveClass('text-green-600')
    })

    it('should apply correct color class for negative changes', () => {
      const assetWithNegativeChanges = {
        ...mockAssetDetail,
        price_change_percentage_7d: -5.5,
        price_change_percentage_30d: -10.2,
      }
      render(<AssetDetails asset={assetWithNegativeChanges} />)

      const change7d = screen.getByText('-5.50%')
      const change30d = screen.getByText('-10.20%')

      expect(change7d).toHaveClass('text-red-600')
      expect(change30d).toHaveClass('text-red-600')
    })

    it('should apply correct color class for ATH negative change', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const athChange = screen.getByText('-34.78%')
      expect(athChange).toHaveClass('text-red-600')
    })

    it('should apply correct color class for ATL positive change', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      const atlChange = screen.getByText(/\+66.*279.*89%/)
      expect(atlChange).toHaveClass('text-green-600')
    })
  })

  describe('Responsive Layout', () => {
    it('should render grid layouts for market stats', () => {
      const { container } = render(<AssetDetails asset={mockAssetDetail} />)

      const grids = container.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
    })

    it('should render cards for each stat', () => {
      render(<AssetDetails asset={mockAssetDetail} />)

      // Check for multiple card sections
      expect(screen.getByText('Market Cap')).toBeInTheDocument()
      expect(screen.getByText('24h Volume')).toBeInTheDocument()
      expect(screen.getByText('Circulating Supply')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const assetWithZeros = {
        ...mockAssetDetail,
        current_price: 0,
        market_cap: 0,
      }
      render(<AssetDetails asset={assetWithZeros} />)

      const zeroValues = screen.getAllByText('$0.00')
      expect(zeroValues.length).toBeGreaterThan(0)
    })

    it('should handle very large numbers', () => {
      const assetWithLargeNumbers = {
        ...mockAssetDetail,
        market_cap: 999999999999999,
      }
      render(<AssetDetails asset={assetWithLargeNumbers} />)

      expect(screen.getByText('$999,999,999,999,999.00')).toBeInTheDocument()
    })

    it('should handle very small positive change', () => {
      const assetWithSmallChange = {
        ...mockAssetDetail,
        price_change_percentage_24h: 0.01,
      }
      render(<AssetDetails asset={assetWithSmallChange} />)

      expect(screen.getByText('+0.01%')).toBeInTheDocument()
    })

    it('should handle exactly zero change', () => {
      const assetWithZeroChange = {
        ...mockAssetDetail,
        price_change_percentage_24h: 0,
      }
      render(<AssetDetails asset={assetWithZeroChange} />)

      expect(screen.getByText('+0.00%')).toBeInTheDocument()
      // Should show trending up for zero (non-negative)
      const badge = screen.getByText('+0.00%').closest('span')
      expect(badge).toHaveClass('bg-primary')
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalAsset = {
        ...mockAssetDetail,
        max_supply: null,
        homepage: null as unknown as string,
        blockchain_site: null as unknown as string,
        description: null as unknown as string,
        categories: [],
      }
      render(<AssetDetails asset={minimalAsset} />)

      // Should still render basic info
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getByText('$45,000.00')).toBeInTheDocument()
    })
  })
})
