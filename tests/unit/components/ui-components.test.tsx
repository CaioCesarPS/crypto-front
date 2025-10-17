import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState } from '@/components/error-state'
import { SearchBar } from '@/components/search-bar'

describe('ErrorState Component', () => {
  describe('Rendering', () => {
    it('should render error message', () => {
      render(<ErrorState message="Test error message" />)

      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should render default title when not provided', () => {
      render(<ErrorState message="Test error" />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should render custom title when provided', () => {
      render(
        <ErrorState
          title="Custom Error Title"
          message="Test error"
        />
      )

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should render error icon', () => {
      const { container } = render(<ErrorState message="Test error" />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('should render retry button when onRetry is provided', () => {
      const mockOnRetry = jest.fn()

      render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
        />
      )

      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument()
    })

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorState message="Test error" />)

      expect(
        screen.queryByRole('button', { name: /try again/i })
      ).not.toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()

      render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should disable retry button when retrying', () => {
      const mockOnRetry = jest.fn()

      render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
          retrying={true}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retrying/i })
      expect(retryButton).toBeDisabled()
    })

    it('should show retrying text when retrying', () => {
      const mockOnRetry = jest.fn()

      render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
          retrying={true}
        />
      )

      expect(screen.getByText('Retrying...')).toBeInTheDocument()
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
    })

    it('should show spin animation on icon when retrying', () => {
      const mockOnRetry = jest.fn()

      const { container } = render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
          retrying={true}
        />
      )

      const spinningIcon = container.querySelector('.animate-spin')
      expect(spinningIcon).toBeInTheDocument()
    })

    it('should not show spin animation when not retrying', () => {
      const mockOnRetry = jest.fn()

      const { container } = render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
          retrying={false}
        />
      )

      const spinningIcon = container.querySelector('.animate-spin')
      expect(spinningIcon).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      const mockOnRetry = jest.fn()

      render(
        <ErrorState
          message="Test error"
          onRetry={mockOnRetry}
        />
      )

      const button = screen.getByRole('button', { name: /try again/i })
      expect(button).toBeInTheDocument()
    })

    it('should have proper alert structure', () => {
      const { container } = render(<ErrorState message="Test error" />)

      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })
  })
})

describe('SearchBar Component', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render input field', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render search icon', () => {
      const { container } = render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should render default placeholder', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      expect(
        screen.getByPlaceholderText('Search cryptocurrencies...')
      ).toBeInTheDocument()
    })

    it('should render custom placeholder', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          placeholder="Custom placeholder"
        />
      )

      expect(
        screen.getByPlaceholderText('Custom placeholder')
      ).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText('Search cryptocurrencies...')
      ).not.toBeInTheDocument()
    })

    it('should display current value', () => {
      render(
        <SearchBar
          value="bitcoin"
          onChange={mockOnChange}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('bitcoin')
    })
  })

  describe('User Input', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'ethereum')

      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange.mock.calls[0][0]).toBe('e')
    })

    it('should update input value when onChange is called', async () => {
      const user = userEvent.setup()
      let value = ''
      const handleChange = (newValue: string) => {
        value = newValue
        mockOnChange(newValue)
      }

      const { rerender } = render(
        <SearchBar
          value={value}
          onChange={handleChange}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'b')

      value = 'b'
      rerender(
        <SearchBar
          value={value}
          onChange={handleChange}
        />
      )

      expect((input as HTMLInputElement).value).toBe('b')
    })
  })

  describe('Clear Button', () => {
    it('should not show clear button when input is empty', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      const clearButton = screen.queryByRole('button')
      expect(clearButton).not.toBeInTheDocument()
    })

    it('should show clear button when input has value', () => {
      render(
        <SearchBar
          value="bitcoin"
          onChange={mockOnChange}
        />
      )

      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('should call onChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          value="bitcoin"
          onChange={mockOnChange}
        />
      )

      const clearButton = screen.getByRole('button')
      await user.click(clearButton)

      expect(mockOnChange).toHaveBeenCalledWith('')
    })

    it('should render X icon in clear button', () => {
      render(
        <SearchBar
          value="bitcoin"
          onChange={mockOnChange}
        />
      )

      const clearButton = screen.getByRole('button')
      const xIcon = clearButton.querySelector('svg')
      expect(xIcon).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input values', () => {
      const longValue = 'a'.repeat(200)

      render(
        <SearchBar
          value={longValue}
          onChange={mockOnChange}
        />
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(longValue)
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, '!@#$%')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle rapid typing', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'test')

      expect(mockOnChange).toHaveBeenCalledTimes(4)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible textbox role', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should have accessible clear button when visible', () => {
      render(
        <SearchBar
          value="test"
          onChange={mockOnChange}
        />
      )

      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })
  })
})
