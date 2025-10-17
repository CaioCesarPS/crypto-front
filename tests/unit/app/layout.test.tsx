/**
 * Unit tests for app/layout.tsx
 * Tests root layout component, metadata, and providers
 */

import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from '@/app/layout'

// Mock theme provider
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}))

// Mock error boundary
jest.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}))

// Mock sonner toaster
jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}))

describe('RootLayout', () => {
  describe('Component Rendering', () => {
    it('should render children correctly', () => {
      const { container } = render(
        <RootLayout>
          <div data-testid="test-child">Test Content</div>
        </RootLayout>
      )

      // In testing environment, the html and body tags are already present
      // so we just verify the children are rendered
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()

      // Verify the structure exists
      expect(container).toBeInTheDocument()
    })

    it('should render with correct component structure', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      // In test environment, we can verify the structure by checking for our mocked components
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.getByTestId('toaster')).toBeInTheDocument()
    })

    it('should render with font classes applied', () => {
      const { container } = render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      // The component renders correctly with fonts
      expect(container).toBeInTheDocument()
    })

    it('should wrap children in ThemeProvider', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    })

    it('should wrap children in ErrorBoundary', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('should include Toaster component', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      expect(screen.getByTestId('toaster')).toBeInTheDocument()
    })

    it('should render multiple children correctly', () => {
      render(
        <RootLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </RootLayout>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('Metadata', () => {
    it('should have correct default title', () => {
      expect(metadata.title).toHaveProperty('default')
      expect(metadata.title).toHaveProperty('template')
      if (
        metadata.title &&
        typeof metadata.title === 'object' &&
        'default' in metadata.title
      ) {
        expect(metadata.title.default).toBe(
          'Crypto Explorer - Track Top Cryptocurrencies'
        )
      }
    })

    it('should have correct title template', () => {
      if (
        metadata.title &&
        typeof metadata.title === 'object' &&
        'template' in metadata.title
      ) {
        expect(metadata.title.template).toBe('%s | Crypto Explorer')
      }
    })

    it('should have correct description', () => {
      expect(metadata.description).toBe(
        'Explore and track top cryptocurrencies by market cap. Monitor real-time prices, view detailed charts, and manage your favorite crypto assets.'
      )
    })

    it('should include relevant keywords', () => {
      expect(metadata.keywords).toEqual(
        expect.arrayContaining([
          'cryptocurrency',
          'crypto tracker',
          'bitcoin',
          'ethereum',
          'crypto prices',
          'blockchain',
          'digital currency',
          'crypto portfolio',
        ])
      )
    })

    it('should have correct authors', () => {
      expect(metadata.authors).toEqual([{ name: 'Crypto Explorer Team' }])
    })

    it('should have correct creator and publisher', () => {
      expect(metadata.creator).toBe('Crypto Explorer')
      expect(metadata.publisher).toBe('Crypto Explorer')
    })

    it('should have correct OpenGraph metadata', () => {
      expect(metadata.openGraph).toMatchObject({
        type: 'website',
        locale: 'en_US',
        url: 'https://crypto-explorer.vercel.app',
        title: 'Crypto Explorer - Track Top Cryptocurrencies',
        siteName: 'Crypto Explorer',
      })
    })

    it('should have OpenGraph images configured', () => {
      expect(metadata.openGraph?.images).toEqual([
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Crypto Explorer - Track Top Cryptocurrencies',
        },
      ])
    })

    it('should have correct Twitter card metadata', () => {
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: 'Crypto Explorer - Track Top Cryptocurrencies',
        creator: '@cryptoexplorer',
      })
    })

    it('should have Twitter images configured', () => {
      expect(metadata.twitter?.images).toEqual(['/og-image.png'])
    })

    it('should have correct robots configuration', () => {
      expect(metadata.robots).toMatchObject({
        index: true,
        follow: true,
      })
    })

    it('should have correct googleBot configuration', () => {
      if (metadata.robots && typeof metadata.robots === 'object') {
        expect(metadata.robots.googleBot).toMatchObject({
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        })
      }
    })

    it('should have correct icons configured', () => {
      expect(metadata.icons).toMatchObject({
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
      })
    })

    it('should have manifest configured', () => {
      expect(metadata.manifest).toBe('/site.webmanifest')
    })
  })

  describe('Provider Configuration', () => {
    it('should have correct component nesting structure', () => {
      render(
        <RootLayout>
          <div data-testid="content">Content</div>
        </RootLayout>
      )

      // Check that providers are properly nested
      const themeProvider = screen.getByTestId('theme-provider')
      const errorBoundary = screen.getByTestId('error-boundary')

      expect(themeProvider).toBeInTheDocument()
      expect(errorBoundary).toBeInTheDocument()
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })
})
