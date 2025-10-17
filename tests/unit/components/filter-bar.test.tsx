/**
 * Unit tests for components/filter-bar.tsx
 * Tests filter and sort functionality with select components
 */

import { render, screen } from '@testing-library/react'
import { FilterBar } from '@/components/filter-bar'
import type { SortOption, FilterOption } from '@/components/filter-bar'

// Mock UI components
jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => (
    <div
      data-testid="select"
      data-value={value}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    id,
  }: {
    children: React.ReactNode
    id: string
  }) => (
    <button
      data-testid={`select-trigger-${id}`}
      id={id}
    >
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => <button data-testid={`select-item-${value}`}>{children}</button>,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({
    children,
    htmlFor,
    className,
  }: {
    children: React.ReactNode
    htmlFor: string
    className: string
  }) => (
    <label
      htmlFor={htmlFor}
      className={className}
    >
      {children}
    </label>
  ),
}))

describe('FilterBar', () => {
  const defaultProps = {
    sortBy: 'default' as SortOption,
    onSortChange: jest.fn(),
    filter: 'all' as FilterOption,
    onFilterChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('should render filter bar container', () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const filterBarDiv = container.firstChild as HTMLElement
      expect(filterBarDiv).toBeInTheDocument()
      expect(filterBarDiv).toHaveClass('flex')
    })

    it('should have responsive layout classes', () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const filterBarDiv = container.firstChild as HTMLElement
      expect(filterBarDiv).toHaveClass('flex-col')
      expect(filterBarDiv).toHaveClass('sm:flex-row')
      expect(filterBarDiv).toHaveClass('gap-4')
    })

    it('should render two main sections', () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const sections = container.querySelectorAll('.flex-1')
      expect(sections).toHaveLength(2)
    })
  })

  describe('Sort Section', () => {
    it('should render sort label', () => {
      render(<FilterBar {...defaultProps} />)

      const sortLabel = screen.getAllByText('Sort by')[0]!
      expect(sortLabel).toBeInTheDocument()
      expect(sortLabel.tagName).toBe('LABEL')
    })

    it('should have sort label linked to select', () => {
      render(<FilterBar {...defaultProps} />)

      const sortLabel = screen.getAllByText('Sort by')[0]!
      expect(sortLabel).toHaveAttribute('for', 'sort')
    })

    it('should render sort select trigger', () => {
      render(<FilterBar {...defaultProps} />)

      const sortTrigger = screen.getByTestId('select-trigger-sort')
      expect(sortTrigger).toBeInTheDocument()
      expect(sortTrigger).toHaveAttribute('id', 'sort')
    })

    it('should display sort placeholder', () => {
      render(<FilterBar {...defaultProps} />)

      const sortTexts = screen.getAllByText('Sort by')
      expect(sortTexts.length).toBeGreaterThan(0)
    })
  })

  describe('Filter Section', () => {
    it('should render filter label', () => {
      render(<FilterBar {...defaultProps} />)

      const filterLabel = screen.getByLabelText('Filter')
      expect(filterLabel).toBeInTheDocument()
    })

    it('should have filter label linked to select', () => {
      render(<FilterBar {...defaultProps} />)

      const filterLabels = screen.getAllByText('Filter')
      const filterLabel = filterLabels[0]!
      expect(filterLabel.tagName).toBe('LABEL')
      expect(filterLabel).toHaveAttribute('for', 'filter')
    })

    it('should render filter select trigger', () => {
      render(<FilterBar {...defaultProps} />)

      const filterTrigger = screen.getByTestId('select-trigger-filter')
      expect(filterTrigger).toBeInTheDocument()
      expect(filterTrigger).toHaveAttribute('id', 'filter')
    })

    it('should display filter placeholder', () => {
      render(<FilterBar {...defaultProps} />)

      // Filter text appears both as label and placeholder
      const filterTexts = screen.getAllByText('Filter')
      expect(filterTexts.length).toBeGreaterThan(0)
    })
  })

  describe('Sort Options', () => {
    it('should render all sort options', () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByText('Market Cap (Default)')).toBeInTheDocument()
      expect(screen.getByText('Price: Low to High')).toBeInTheDocument()
      expect(screen.getByText('Price: High to Low')).toBeInTheDocument()
      expect(screen.getByText('24h Change: Low to High')).toBeInTheDocument()
      expect(screen.getByText('24h Change: High to Low')).toBeInTheDocument()
    })

    it('should have correct values for sort options', () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByTestId('select-item-default')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-price-asc')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-price-desc')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-change-asc')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-change-desc')).toBeInTheDocument()
    })
  })

  describe('Filter Options', () => {
    it('should render all filter options', () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByText('All Assets')).toBeInTheDocument()
      expect(screen.getByText('Gainers (24h)')).toBeInTheDocument()
      expect(screen.getByText('Losers (24h)')).toBeInTheDocument()
    })

    it('should have correct values for filter options', () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByTestId('select-item-all')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-gainers')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-losers')).toBeInTheDocument()
    })
  })

  describe('Sort Value Prop', () => {
    it('should pass default sort value', () => {
      render(
        <FilterBar
          {...defaultProps}
          sortBy="default"
        />
      )

      const select = screen.getAllByTestId('select')[0]
      expect(select).toHaveAttribute('data-value', 'default')
    })

    it('should pass price-asc sort value', () => {
      render(
        <FilterBar
          {...defaultProps}
          sortBy="price-asc"
        />
      )

      const select = screen.getAllByTestId('select')[0]
      expect(select).toHaveAttribute('data-value', 'price-asc')
    })

    it('should pass price-desc sort value', () => {
      render(
        <FilterBar
          {...defaultProps}
          sortBy="price-desc"
        />
      )

      const select = screen.getAllByTestId('select')[0]
      expect(select).toHaveAttribute('data-value', 'price-desc')
    })

    it('should pass change-asc sort value', () => {
      render(
        <FilterBar
          {...defaultProps}
          sortBy="change-asc"
        />
      )

      const select = screen.getAllByTestId('select')[0]
      expect(select).toHaveAttribute('data-value', 'change-asc')
    })

    it('should pass change-desc sort value', () => {
      render(
        <FilterBar
          {...defaultProps}
          sortBy="change-desc"
        />
      )

      const select = screen.getAllByTestId('select')[0]
      expect(select).toHaveAttribute('data-value', 'change-desc')
    })
  })

  describe('Filter Value Prop', () => {
    it('should pass all filter value', () => {
      render(
        <FilterBar
          {...defaultProps}
          filter="all"
        />
      )

      const selects = screen.getAllByTestId('select')
      const filterSelect = selects[1]
      expect(filterSelect).toHaveAttribute('data-value', 'all')
    })

    it('should pass gainers filter value', () => {
      render(
        <FilterBar
          {...defaultProps}
          filter="gainers"
        />
      )

      const selects = screen.getAllByTestId('select')
      const filterSelect = selects[1]
      expect(filterSelect).toHaveAttribute('data-value', 'gainers')
    })

    it('should pass losers filter value', () => {
      render(
        <FilterBar
          {...defaultProps}
          filter="losers"
        />
      )

      const selects = screen.getAllByTestId('select')
      const filterSelect = selects[1]
      expect(filterSelect).toHaveAttribute('data-value', 'losers')
    })
  })

  describe('Callback Props', () => {
    it('should accept onSortChange callback', () => {
      const onSortChange = jest.fn()
      render(
        <FilterBar
          {...defaultProps}
          onSortChange={onSortChange}
        />
      )

      // Callback should be passed to component
      expect(onSortChange).not.toHaveBeenCalled()
    })

    it('should accept onFilterChange callback', () => {
      const onFilterChange = jest.fn()
      render(
        <FilterBar
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      )

      // Callback should be passed to component
      expect(onFilterChange).not.toHaveBeenCalled()
    })
  })

  describe('Label Styling', () => {
    it('should have correct label styles', () => {
      render(<FilterBar {...defaultProps} />)

      const sortLabel = screen.getAllByText('Sort by')[0]!
      expect(sortLabel).toHaveClass('text-sm')
      expect(sortLabel).toHaveClass('font-medium')
      expect(sortLabel).toHaveClass('mb-2')
      expect(sortLabel).toHaveClass('block')
    })

    it('should apply same styles to both labels', () => {
      render(<FilterBar {...defaultProps} />)

      const sortLabel = screen.getAllByText('Sort by')[0]!
      const filterLabel = screen.getAllByText('Filter')[0]!

      expect(sortLabel.className).toBe(filterLabel.className)
    })
  })

  describe('TypeScript Types', () => {
    it('should accept all SortOption types', () => {
      const sortOptions: SortOption[] = [
        'default',
        'price-asc',
        'price-desc',
        'change-asc',
        'change-desc',
      ]

      sortOptions.forEach((sortBy) => {
        const { unmount } = render(
          <FilterBar
            {...defaultProps}
            sortBy={sortBy}
          />
        )
        expect(screen.getAllByTestId('select')[0]).toHaveAttribute(
          'data-value',
          sortBy
        )
        unmount()
      })
    })

    it('should accept all FilterOption types', () => {
      const filterOptions: FilterOption[] = ['all', 'gainers', 'losers']

      filterOptions.forEach((filter) => {
        const { unmount } = render(
          <FilterBar
            {...defaultProps}
            filter={filter}
          />
        )
        const selects = screen.getAllByTestId('select')
        expect(selects[1]).toHaveAttribute('data-value', filter)
        unmount()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper label for attributes', () => {
      render(<FilterBar {...defaultProps} />)

      const sortLabel = screen.getAllByText('Sort by')[0]!
      const filterLabel = screen.getAllByText('Filter')[0]!

      expect(sortLabel).toHaveAttribute('for', 'sort')
      expect(filterLabel).toHaveAttribute('for', 'filter')
    })

    it('should have matching ids on select triggers', () => {
      render(<FilterBar {...defaultProps} />)

      const sortTrigger = screen.getByTestId('select-trigger-sort')
      const filterTrigger = screen.getByTestId('select-trigger-filter')

      expect(sortTrigger).toHaveAttribute('id', 'sort')
      expect(filterTrigger).toHaveAttribute('id', 'filter')
    })
  })

  describe('Responsive Behavior', () => {
    it('should stack vertically on mobile', () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const filterBarDiv = container.firstChild as HTMLElement
      expect(filterBarDiv).toHaveClass('flex-col')
    })

    it('should display horizontally on larger screens', () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const filterBarDiv = container.firstChild as HTMLElement
      expect(filterBarDiv).toHaveClass('sm:flex-row')
    })

    it('should have equal width sections', () => {
      const { container } = render(<FilterBar {...defaultProps} />)

      const sections = container.querySelectorAll('.flex-1')
      sections.forEach((section) => {
        expect(section).toHaveClass('flex-1')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(
        <FilterBar
          {...defaultProps}
          sortBy="default"
          filter="all"
        />
      )

      rerender(
        <FilterBar
          {...defaultProps}
          sortBy="price-asc"
          filter="gainers"
        />
      )
      rerender(
        <FilterBar
          {...defaultProps}
          sortBy="price-desc"
          filter="losers"
        />
      )

      const selects = screen.getAllByTestId('select')
      expect(selects[0]).toHaveAttribute('data-value', 'price-desc')
      expect(selects[1]).toHaveAttribute('data-value', 'losers')
    })

    it('should maintain structure with different prop combinations', () => {
      const combinations: Array<{
        sortBy: SortOption
        filter: FilterOption
      }> = [
        { sortBy: 'default', filter: 'all' },
        { sortBy: 'price-asc', filter: 'gainers' },
        { sortBy: 'change-desc', filter: 'losers' },
      ]

      combinations.forEach(({ sortBy, filter }) => {
        const { unmount } = render(
          <FilterBar
            {...defaultProps}
            sortBy={sortBy}
            filter={filter}
          />
        )

        expect(screen.getAllByText('Sort by')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Filter')[0]).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('Component Integration', () => {
    it('should render both selects independently', () => {
      render(<FilterBar {...defaultProps} />)

      const selects = screen.getAllByTestId('select')
      expect(selects).toHaveLength(2)
    })

    it('should maintain separate state for each select', () => {
      render(
        <FilterBar
          {...defaultProps}
          sortBy="price-asc"
          filter="gainers"
        />
      )

      const selects = screen.getAllByTestId('select')
      expect(selects[0]).toHaveAttribute('data-value', 'price-asc')
      expect(selects[1]).toHaveAttribute('data-value', 'gainers')
    })
  })

  describe('Content Verification', () => {
    it('should display correct sort option labels', () => {
      render(<FilterBar {...defaultProps} />)

      const sortLabels = [
        'Market Cap (Default)',
        'Price: Low to High',
        'Price: High to Low',
        '24h Change: Low to High',
        '24h Change: High to Low',
      ]

      sortLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('should display correct filter option labels', () => {
      render(<FilterBar {...defaultProps} />)

      const filterLabels = ['All Assets', 'Gainers (24h)', 'Losers (24h)']

      filterLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('should have descriptive option text', () => {
      render(<FilterBar {...defaultProps} />)

      // Sort options should be descriptive
      expect(screen.getByText(/Market Cap/)).toBeInTheDocument()
      expect(screen.getAllByText(/Price:/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/24h Change:/)[0]).toBeInTheDocument()

      // Filter options should be descriptive
      expect(screen.getByText(/Assets/)).toBeInTheDocument()
      expect(screen.getByText(/Gainers/)).toBeInTheDocument()
      expect(screen.getByText(/Losers/)).toBeInTheDocument()
    })
  })
})
