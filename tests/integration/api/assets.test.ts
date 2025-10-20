/**
 * Integration tests for /api/assets endpoint
 * Tests pagination, caching, error handling, and data validation
 */

import { GET } from '@/app/api/assets/route'
import { assetsCache } from '@/lib/cache'
import { createTestRequest } from '../../helpers/request-helpers'

// Mock fetch for CoinGecko API
global.fetch = jest.fn()

describe('/api/assets Integration Tests', () => {
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
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    // Clear the cache to ensure tests are isolated
    assetsCache.clear()
  })

  describe('Successful Requests', () => {
    it('should fetch assets with default pagination', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.assets).toEqual(mockAssets)
      expect(data.page).toBe(1)
      expect(data.perPage).toBe(10)
      expect(data.hasMore).toBe(false) // Less than perPage
    })

    it('should fetch assets with custom page', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=2'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.page).toBe(2)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
    })

    it('should fetch assets with custom per_page', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?per_page=50'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.perPage).toBe(50)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=50'),
        expect.any(Object)
      )
    })

    it('should fetch assets with both page and per_page', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=3&per_page=25'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.page).toBe(3)
      expect(data.perPage).toBe(25)
    })

    it('should indicate hasMore when results equal perPage', async () => {
      const fullPage = Array(10).fill(mockAssets[0])
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => fullPage,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?per_page=10'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.hasMore).toBe(true)
      expect(data.assets.length).toBe(10)
    })
  })

  describe('Query Parameter Validation', () => {
    it('should handle negative page numbers', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=-1'
      )
      const response = await GET(request)
      const data = await response.json()

      // Should default to page 1
      expect(data.page).toBe(1)
    })

    it('should handle zero page number', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=0'
      )
      const response = await GET(request)
      const data = await response.json()

      // Should default to page 1
      expect(data.page).toBe(1)
    })

    it('should handle per_page exceeding maximum (250)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?per_page=500'
      )
      const response = await GET(request)
      const data = await response.json()

      // Should cap at 250
      expect(data.perPage).toBe(250)
    })

    it('should handle negative per_page', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?per_page=-10'
      )
      const response = await GET(request)
      const data = await response.json()

      // Should default to 1
      expect(data.perPage).toBe(1)
    })

    it('should handle invalid page parameter', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=invalid'
      )
      const response = await GET(request)
      const data = await response.json()

      // Should default to page 1
      expect(data.page).toBe(1)
    })

    it('should handle invalid per_page parameter', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?per_page=abc'
      )
      const response = await GET(request)
      const data = await response.json()

      // Should default to 20
      expect(data.perPage).toBe(10)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when CoinGecko API fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch crypto assets')
    })

    it('should return 500 when fetch throws an error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch crypto assets')
    })

    it('should handle JSON parsing errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch crypto assets')
    })
  })

  describe('CoinGecko API Integration', () => {
    it('should call CoinGecko API with correct parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=2&per_page=30'
      )
      await GET(request)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=2&sparkline=false',
        {
          next: { revalidate: 300 },
          headers: {
            Accept: 'application/json',
          },
        }
      )
    })

    it('should use correct currency parameter', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      await GET(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('vs_currency=usd'),
        expect.any(Object)
      )
    })

    it('should use market_cap_desc ordering', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      await GET(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('order=market_cap_desc'),
        expect.any(Object)
      )
    })

    it('should disable sparkline data', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      await GET(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sparkline=false'),
        expect.any(Object)
      )
    })
  })

  describe('Response Format', () => {
    it('should return correct response structure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('assets')
      expect(data).toHaveProperty('page')
      expect(data).toHaveProperty('perPage')
      expect(data).toHaveProperty('hasMore')
    })

    it('should return array of assets', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(Array.isArray(data.assets)).toBe(true)
      expect(data.assets.length).toBe(2)
    })

    it('should preserve asset data structure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      const asset = data.assets[0]
      expect(asset).toHaveProperty('id')
      expect(asset).toHaveProperty('name')
      expect(asset).toHaveProperty('symbol')
      expect(asset).toHaveProperty('image')
      expect(asset).toHaveProperty('current_price')
      expect(asset).toHaveProperty('price_change_percentage_24h')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty results from CoinGecko', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const request = createTestRequest('http://localhost:3000/api/assets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.assets).toEqual([])
      expect(data.hasMore).toBe(false)
    })

    it('should handle very large page numbers', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const request = createTestRequest(
        'http://localhost:3000/api/assets?page=9999'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.page).toBe(9999)
      expect(data.assets).toEqual([])
    })
  })
})
