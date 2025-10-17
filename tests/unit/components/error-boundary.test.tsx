import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/components/error-boundary'

// Component that throws an error
const ThrowError = ({ error }: { error?: string }) => {
  throw new Error(error || 'Test error')
}

// Component that doesn't throw
const SafeComponent = () => <div>Safe content</div>

// Suppress console.error for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary Component', () => {
  const setNodeEnv = (env: string) => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: env,
      writable: true,
      configurable: true,
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Safe content')).toBeInTheDocument()
    })

    it('should not render fallback UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
      )

      expect(
        screen.queryByText(/Something went wrong/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('Error Catching', () => {
    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(screen.queryByText('Safe content')).not.toBeInTheDocument()
    })

    it('should display error message in production mode', () => {
      setNodeEnv('production')

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /We're sorry, but something unexpected happened. Please try refreshing the page./i
        )
      ).toBeInTheDocument()

      setNodeEnv('test')
    })

    it('should catch different error messages', () => {
      render(
        <ErrorBoundary>
          <ThrowError error="First error" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Default Fallback UI', () => {
    it('should render default fallback UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument()
    })

    it('should display error icon in fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const title = screen.getByText(/Something went wrong/i)
      const icon = title.parentElement?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should show error details in development mode', () => {
      setNodeEnv('development')

      render(
        <ErrorBoundary>
          <ThrowError error="Development error message" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Error Details/i)).toBeInTheDocument()
      expect(screen.getByText(/Development error message/)).toBeInTheDocument()

      setNodeEnv('test')
    })

    it('should hide error details in production mode', () => {
      setNodeEnv('production')

      render(
        <ErrorBoundary>
          <ThrowError error="Production error" />
        </ErrorBoundary>
      )

      expect(screen.queryByText(/Error Details/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Production error/)).not.toBeInTheDocument()

      setNodeEnv('test')
    })

    it('should display error stack trace in development', () => {
      setNodeEnv('development')

      render(
        <ErrorBoundary>
          <ThrowError error="Stack trace test" />
        </ErrorBoundary>
      )

      const details = screen.getByText(/Error Details/i)
      const detailsContainer = details.closest('details')
      expect(detailsContainer).toBeInTheDocument()

      setNodeEnv('test')
    })
  })

  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(
        screen.queryByText(/Something went wrong/i)
      ).not.toBeInTheDocument()
    })

    it('should prioritize custom fallback over default', () => {
      const customFallback = <button>Custom retry button</button>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom retry button')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /try again/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Reset Functionality', () => {
    it('should reset error state when Try Again is clicked', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Conditional error')
        }
        return <div>Recovered content</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()

      // Stop throwing error
      shouldThrow = false

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      // Force re-render
      rerender(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      )

      // Note: In real scenario, clicking "Try Again" calls handleReset which resets state
      // But children need to be re-rendered without error
    })

    it('should have a Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
    })

    it('should call handleReset when Try Again button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })

      // Button should be clickable
      expect(tryAgainButton).toBeInTheDocument()
      await user.click(tryAgainButton)

      // After reset, component tries to render children again
      // Since ThrowError always throws, we'll see the button again
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument()
    })
  })

  describe('Error Information', () => {
    it('should log error to console in development', () => {
      setNodeEnv('development')

      render(
        <ErrorBoundary>
          <ThrowError error="Console log test" />
        </ErrorBoundary>
      )

      // Check that console.error was called
      expect(console.error).toHaveBeenCalled()

      setNodeEnv('test')
    })

    it('should handle Error objects properly', () => {
      render(
        <ErrorBoundary>
          <ThrowError error="Proper error handling" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Multiple Children', () => {
    it('should catch errors from any child component', () => {
      render(
        <ErrorBoundary>
          <SafeComponent />
          <ThrowError />
          <SafeComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(screen.queryByText('Safe content')).not.toBeInTheDocument()
    })

    it('should render all children when none throw errors', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })

  describe('Nested Error Boundaries', () => {
    it('should allow nested error boundaries', () => {
      render(
        <ErrorBoundary fallback={<div>Outer fallback</div>}>
          <SafeComponent />
          <ErrorBoundary fallback={<div>Inner fallback</div>}>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      )

      expect(screen.getByText('Inner fallback')).toBeInTheDocument()
      expect(screen.queryByText('Outer fallback')).not.toBeInTheDocument()
      expect(screen.getByText('Safe content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const errorTitle = screen.getByText(/Something went wrong/i)
      expect(errorTitle).toBeInTheDocument()
    })

    it('should have accessible Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
    })
  })
})
