/**
 * Unit tests for components/nav-header.tsx
 * Tests navigation header, links, theme toggle, and active states
 */

import { render, screen } from '@testing-library/react'
import { NavHeader } from '@/components/nav-header'
import { usePathname } from 'next/navigation'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a
      href={href}
      className={className}
    >
      {children}
    </a>
  ),
}))

// Mock ThemeToggle component
jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Coins: () => <svg data-testid="coins-icon" />,
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('NavHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Header Structure', () => {
    it('should render header element with correct styling', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
      expect(header).toHaveClass('z-50')
      expect(header).toHaveClass('border-b')
    })

    it('should have backdrop blur support', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('backdrop-blur')
    })

    it('should render container with flex layout', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const headerDiv = container.querySelector('header > div')
      expect(headerDiv).toBeInTheDocument()
      expect(headerDiv).toHaveClass('flex')
      expect(headerDiv).toHaveClass('items-center')
    })
  })

  describe('Logo Section', () => {
    it('should render logo link', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const logoLink = screen.getByText('Crypto Explorer').closest('a')
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute('href', '/')
    })

    it('should render Coins icon', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const icon = screen.getByTestId('coins-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should render logo text', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      expect(screen.getByText('Crypto Explorer')).toBeInTheDocument()
    })

    it('should have correct logo styling', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const logoText = screen.getByText('Crypto Explorer')
      expect(logoText).toHaveClass('font-bold')
      expect(logoText).toHaveClass('text-xl')
    })
  })

  describe('Navigation Links', () => {
    it('should render Explorer link', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toBeInTheDocument()
      expect(explorerLink.closest('a')).toHaveAttribute('href', '/')
    })

    it('should render Favorites link', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const favoritesLink = screen.getByText('Favorites')
      expect(favoritesLink).toBeInTheDocument()
      expect(favoritesLink.closest('a')).toHaveAttribute('href', '/favorites')
    })

    it('should have nav element with flex layout', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('flex')
      expect(nav).toHaveClass('items-center')
    })

    it('should have transition classes on links', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toHaveClass('transition-colors')
      expect(explorerLink).toHaveClass('hover:text-foreground/80')
    })
  })

  describe('Active State - Home Page', () => {
    it('should mark Explorer as active when on home page', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toHaveClass('text-foreground')
      expect(explorerLink).not.toHaveClass('text-foreground/60')
    })

    it('should mark Favorites as inactive when on home page', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const favoritesLink = screen.getByText('Favorites')
      expect(favoritesLink).toHaveClass('text-foreground/60')
      expect(favoritesLink).not.toHaveClass('text-foreground')
    })
  })

  describe('Active State - Favorites Page', () => {
    it('should mark Favorites as active when on favorites page', () => {
      mockUsePathname.mockReturnValue('/favorites')
      render(<NavHeader />)

      const favoritesLink = screen.getByText('Favorites')
      expect(favoritesLink).toHaveClass('text-foreground')
      expect(favoritesLink).not.toHaveClass('text-foreground/60')
    })

    it('should mark Explorer as inactive when on favorites page', () => {
      mockUsePathname.mockReturnValue('/favorites')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toHaveClass('text-foreground/60')
      expect(explorerLink).not.toHaveClass('text-foreground')
    })
  })

  describe('Active State - Other Pages', () => {
    it('should mark both links as inactive on asset detail page', () => {
      mockUsePathname.mockReturnValue('/assets/bitcoin')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      const favoritesLink = screen.getByText('Favorites')

      expect(explorerLink).toHaveClass('text-foreground/60')
      expect(favoritesLink).toHaveClass('text-foreground/60')
    })

    it('should handle unknown routes', () => {
      mockUsePathname.mockReturnValue('/unknown-route')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      const favoritesLink = screen.getByText('Favorites')

      expect(explorerLink).toHaveClass('text-foreground/60')
      expect(favoritesLink).toHaveClass('text-foreground/60')
    })
  })

  describe('Theme Toggle', () => {
    it('should render ThemeToggle component', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const themeToggle = screen.getByTestId('theme-toggle')
      expect(themeToggle).toBeInTheDocument()
    })

    it('should position ThemeToggle at the end', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const themeToggle = screen.getByTestId('theme-toggle')
      const headerDiv = container.querySelector('header > div')
      const lastChild = headerDiv?.lastElementChild

      expect(lastChild).toContainElement(themeToggle)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive layout', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const headerDiv = container.querySelector('header > div')
      expect(headerDiv).toHaveClass('flex')
      expect(headerDiv).toHaveClass('justify-between')
    })

    it('should maintain proper spacing between elements', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const logoLink = screen.getByText('Crypto Explorer').closest('a')
      expect(logoLink).toHaveClass('mr-6')

      const nav = screen.getByText('Explorer').closest('nav')
      expect(nav).toHaveClass('space-x-6')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic header element', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const header = container.querySelector('header')
      expect(header?.tagName).toBe('HEADER')
    })

    it('should have semantic nav element', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const nav = container.querySelector('nav')
      expect(nav?.tagName).toBe('NAV')
    })

    it('should have proper link structure', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      links.forEach((link) => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Path Matching', () => {
    it('should use usePathname hook', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      expect(mockUsePathname).toHaveBeenCalled()
    })

    it('should handle root path correctly', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toHaveClass('text-foreground')
    })

    it('should handle favorites path correctly', () => {
      mockUsePathname.mockReturnValue('/favorites')
      render(<NavHeader />)

      const favoritesLink = screen.getByText('Favorites')
      expect(favoritesLink).toHaveClass('text-foreground')
    })

    it('should be case-sensitive for path matching', () => {
      mockUsePathname.mockReturnValue('/FAVORITES')
      render(<NavHeader />)

      const favoritesLink = screen.getByText('Favorites')
      // Should not match uppercase path
      expect(favoritesLink).toHaveClass('text-foreground/60')
    })
  })

  describe('Styling and Layout', () => {
    it('should have sticky positioning', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
      expect(header).toHaveClass('z-50')
    })

    it('should have full width', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('w-full')
    })

    it('should have border bottom', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('border-b')
    })

    it('should have correct height', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const headerDiv = container.querySelector('header > div')
      expect(headerDiv).toHaveClass('h-14')
    })
  })

  describe('Logo Link Behavior', () => {
    it('should have logo link elements grouped together', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<NavHeader />)

      const logoLink = container.querySelector('a[href="/"]')
      expect(logoLink).toHaveClass('flex')
      expect(logoLink).toHaveClass('items-center')
      expect(logoLink).toHaveClass('space-x-2')
    })

    it('should contain both icon and text in logo link', () => {
      mockUsePathname.mockReturnValue('/')
      render(<NavHeader />)

      const logoLink = screen.getByText('Crypto Explorer').closest('a')
      const icon = screen.getByTestId('coins-icon')

      expect(logoLink).toContainElement(icon)
      expect(logoLink).toContainElement(screen.getByText('Crypto Explorer'))
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('')
      render(<NavHeader />)

      // Should render without errors
      expect(screen.getByText('Crypto Explorer')).toBeInTheDocument()
    })

    it('should handle pathname with trailing slash', () => {
      mockUsePathname.mockReturnValue('/favorites/')
      render(<NavHeader />)

      const favoritesLink = screen.getByText('Favorites')
      // Exact match required, so trailing slash means no match
      expect(favoritesLink).toHaveClass('text-foreground/60')
    })

    it('should handle deep nested paths', () => {
      mockUsePathname.mockReturnValue('/assets/bitcoin/details')
      render(<NavHeader />)

      const explorerLink = screen.getByText('Explorer')
      const favoritesLink = screen.getByText('Favorites')

      expect(explorerLink).toHaveClass('text-foreground/60')
      expect(favoritesLink).toHaveClass('text-foreground/60')
    })

    it('should re-render when pathname changes', () => {
      mockUsePathname.mockReturnValue('/')
      const { rerender } = render(<NavHeader />)

      let explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toHaveClass('text-foreground')

      mockUsePathname.mockReturnValue('/favorites')
      rerender(<NavHeader />)

      explorerLink = screen.getByText('Explorer')
      expect(explorerLink).toHaveClass('text-foreground/60')
    })
  })
})
