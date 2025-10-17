import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PriceChart } from '@/components/price-chart'
import userEvent from '@testing-library/user-event'

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: React.PropsWithChildren) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="grid" />,
}))

describe('PriceChart Component', () => {
  const mockChartData = [
    { timestamp: 1640000000000, price: 45000 },
    { timestamp: 1640086400000, price: 46000 },
    { timestamp: 1640172800000, price: 45500 },
    { timestamp: 1640259200000, price: 47000 },
    { timestamp: 1640345600000, price: 46500 },
    { timestamp: 1640432000000, price: 48000 },
    { timestamp: 1640518400000, price: 49000 },
  ]

  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading skeleton initially', () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(() => {
            // Never resolve to keep loading state
          })
      )

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      expect(screen.getByText('7-Day Price Chart')).toBeInTheDocument()
      // Skeleton uses data-slot="skeleton" attribute
      const skeleton = document.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should hide loading state after data is fetched', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartData,
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
      })
    })
  })

  describe('Data Fetching', () => {
    it('should fetch chart data on mount', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartData,
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/assets/bitcoin/chart')
      })
    })

    it('should fetch data when assetId changes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockChartData,
      })

      const { rerender } = render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/assets/bitcoin/chart')
      })

      rerender(
        <PriceChart
          assetId="ethereum"
          assetName="Ethereum"
        />
      )

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/assets/ethereum/chart')
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should render chart after successful data fetch', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartData,
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText('7-Day Price Chart - Bitcoin')
        ).toBeInTheDocument()
      })

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch chart data/i)
        ).toBeInTheDocument()
      })

      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
    })

    it('should display error state when request throws', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /try again/i })
        ).toBeInTheDocument()
      })
    })

    it('should retry fetching data when retry button is clicked', async () => {
      const user = userEvent.setup()

      // First fetch fails
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })

      // Second fetch succeeds
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartData,
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      await waitFor(() => {
        expect(
          screen.getByText('7-Day Price Chart - Bitcoin')
        ).toBeInTheDocument()
        expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument()
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Chart Rendering', () => {
    it('should render all chart components when data is loaded', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartData,
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
        expect(screen.getByTestId('line')).toBeInTheDocument()
        expect(screen.getByTestId('x-axis')).toBeInTheDocument()
        expect(screen.getByTestId('y-axis')).toBeInTheDocument()
        expect(screen.getByTestId('grid')).toBeInTheDocument()
      })
    })

    it('should display asset name in chart title', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartData,
      })

      render(
        <PriceChart
          assetId="ethereum"
          assetName="Ethereum"
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText('7-Day Price Chart - Ethereum')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty chart data', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })

    it('should handle single data point', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ timestamp: 1640000000000, price: 45000 }],
      })

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })

    it('should handle non-Error objects in catch', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce('String error')

      render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Failed to load chart/i)).toBeInTheDocument()
      })
    })
  })

  describe('Memoization', () => {
    it('should not re-render when props do not change', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockChartData,
      })

      const { rerender } = render(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      await waitFor(() => {
        expect(
          screen.getByText('7-Day Price Chart - Bitcoin')
        ).toBeInTheDocument()
      })

      const firstFetchCount = (global.fetch as jest.Mock).mock.calls.length

      // Rerender with same props
      rerender(
        <PriceChart
          assetId="bitcoin"
          assetName="Bitcoin"
        />
      )

      // Should not fetch again because props haven't changed
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(
        firstFetchCount
      )
    })
  })
})
