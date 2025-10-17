import { renderHook, waitFor, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 300 })
    expect(result.current).toBe('initial') // Still old value

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'value1' } }
    )

    act(() => {
      rerender({ value: 'value2' })
      jest.advanceTimersByTime(100)

      rerender({ value: 'value3' })
      jest.advanceTimersByTime(100)

      rerender({ value: 'value4' })
      jest.advanceTimersByTime(100)
    })

    // Should still be initial value
    expect(result.current).toBe('value1')

    // After full delay, should have latest value
    act(() => {
      jest.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current).toBe('value4')
    })
  })

  it('should handle different delay times', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should handle zero delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated' })

    act(() => {
      jest.advanceTimersByTime(0)
    })

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
