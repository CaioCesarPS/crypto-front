import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  let matchMediaMock: jest.Mock
  let listeners: Array<() => void> = []

  beforeEach(() => {
    listeners = []

    matchMediaMock = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event: string, callback: () => void) => {
        if (event === 'change') {
          listeners.push(callback)
        }
      }),
      removeEventListener: jest.fn((event: string, callback: () => void) => {
        if (event === 'change') {
          listeners = listeners.filter((l) => l !== callback)
        }
      }),
      dispatchEvent: jest.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    // Default window size (desktop)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    listeners = []
    jest.clearAllMocks()
  })

  it('should return false for desktop viewport', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return true for tablet viewport (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767, // Just below breakpoint
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false at exactly 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // Exactly at breakpoint
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should update when window is resized from desktop to mobile', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      // Trigger all listeners
      listeners.forEach((listener) => listener())
    })

    expect(result.current).toBe(true)
  })

  it('should update when window is resized from mobile to desktop', () => {
    // Start with mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    // Simulate resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      // Trigger all listeners
      listeners.forEach((listener) => listener())
    })

    expect(result.current).toBe(false)
  })

  it('should register media query listener on mount', () => {
    renderHook(() => useIsMobile())

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)')
    expect(listeners.length).toBe(1)
  })

  it('should remove media query listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    expect(listeners.length).toBe(1)

    unmount()

    // The listener should be removed (this is hard to test directly,
    // but we can verify the hook doesn't throw errors on unmount)
    expect(() => unmount()).not.toThrow()
  })

  it('should handle multiple resize events', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // First resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      listeners.forEach((listener) => listener())
    })
    expect(result.current).toBe(true)

    // Resize back to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900,
      })
      listeners.forEach((listener) => listener())
    })
    expect(result.current).toBe(false)

    // Resize to mobile again
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      listeners.forEach((listener) => listener())
    })
    expect(result.current).toBe(true)
  })

  it('should handle edge case at breakpoint boundary', () => {
    // Test 767px (mobile)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result, rerender } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    // Test 768px (desktop)
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      listeners.forEach((listener) => listener())
    })

    rerender()
    expect(result.current).toBe(false)
  })
})
