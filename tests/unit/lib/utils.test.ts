import {
  cn,
  formatPrice,
  formatPercentage,
  getPercentageColor,
} from '@/lib/utils'

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge single class name', () => {
      expect(cn('foo')).toBe('foo')
    })

    it('should merge multiple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional class names', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
    })

    it('should merge Tailwind classes with conflicts', () => {
      // Later classes should override earlier ones
      const result = cn('px-4', 'px-6')
      expect(result).toBe('px-6')
    })

    it('should handle arrays of class names', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
    })

    it('should handle objects with conditional classes', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    it('should handle undefined and null values', () => {
      expect(cn('foo', undefined, 'bar', null, 'baz')).toBe('foo bar baz')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })

    it('should merge complex Tailwind utility classes', () => {
      const result = cn(
        'bg-red-500 hover:bg-blue-500',
        'bg-green-500' // Should override bg-red-500
      )
      expect(result).toBe('hover:bg-blue-500 bg-green-500')
    })

    it('should handle mixed types of inputs', () => {
      const result = cn(
        'foo',
        ['bar', 'baz'],
        { qux: true, quux: false },
        undefined,
        'corge'
      )
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain('baz')
      expect(result).toContain('qux')
      expect(result).not.toContain('quux')
      expect(result).toContain('corge')
    })
  })

  describe('formatPrice', () => {
    it('should format price with full precision by default', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56')
    })

    it('should format large numbers with commas', () => {
      expect(formatPrice(1000000)).toBe('$1,000,000.00')
    })

    it('should format small prices with up to 6 decimal places', () => {
      expect(formatPrice(0.123456)).toBe('$0.123456')
    })

    it('should format very small prices', () => {
      expect(formatPrice(0.000001)).toBe('$0.000001')
    })

    it('should format zero correctly', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('should format negative prices', () => {
      expect(formatPrice(-100.5)).toBe('-$100.50')
    })

    describe('compact mode', () => {
      it('should format thousands compactly', () => {
        const result = formatPrice(1234, true)
        expect(result).toMatch(/\$1(\.|,)23K/)
      })

      it('should format millions compactly', () => {
        const result = formatPrice(1234567, true)
        expect(result).toMatch(/\$1(\.|,)23M/)
      })

      it('should format billions compactly', () => {
        const result = formatPrice(1234567890, true)
        expect(result).toMatch(/\$1(\.|,)23B/)
      })

      it('should format trillions compactly', () => {
        const result = formatPrice(1234567890000, true)
        expect(result).toMatch(/\$1(\.|,)23T/)
      })

      it('should format small numbers without compact notation', () => {
        expect(formatPrice(123.45, true)).toBe('$123.45')
      })

      it('should respect maximumFractionDigits in compact mode', () => {
        const result = formatPrice(1234567, true)
        // Should have at most 2 decimal places in compact form
        const match = result.match(/\$1(\.|,)23M/)
        expect(match).not.toBeNull()
      })
    })
  })

  describe('formatPercentage', () => {
    it('should format positive percentage with + sign', () => {
      expect(formatPercentage(5.5)).toBe('+5.50%')
    })

    it('should format negative percentage with - sign', () => {
      expect(formatPercentage(-3.25)).toBe('-3.25%')
    })

    it('should format zero with + sign', () => {
      expect(formatPercentage(0)).toBe('+0.00%')
    })

    it('should format percentage with 2 decimal places', () => {
      expect(formatPercentage(10.123)).toBe('+10.12%')
    })

    it('should round percentage correctly', () => {
      // JavaScript's toFixed uses "round half to even" (banker's rounding)
      expect(formatPercentage(5.555)).toBe('+5.55%') // Midpoint rounds to even
      expect(formatPercentage(5.556)).toBe('+5.56%') // Rounds up
      expect(formatPercentage(5.554)).toBe('+5.55%') // Rounds down
    })

    it('should handle large percentages', () => {
      expect(formatPercentage(100.5)).toBe('+100.50%')
      expect(formatPercentage(-200.75)).toBe('-200.75%')
    })

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.01)).toBe('+0.01%')
      expect(formatPercentage(-0.01)).toBe('-0.01%')
    })

    it('should format whole numbers with decimals', () => {
      expect(formatPercentage(10)).toBe('+10.00%')
      expect(formatPercentage(-5)).toBe('-5.00%')
    })
  })

  describe('getPercentageColor', () => {
    it('should return green for positive percentage', () => {
      expect(getPercentageColor(5)).toBe('text-green-600')
    })

    it('should return green for zero', () => {
      expect(getPercentageColor(0)).toBe('text-green-600')
    })

    it('should return red for negative percentage', () => {
      expect(getPercentageColor(-5)).toBe('text-red-600')
    })

    it('should return green for very small positive values', () => {
      expect(getPercentageColor(0.01)).toBe('text-green-600')
    })

    it('should return red for very small negative values', () => {
      expect(getPercentageColor(-0.01)).toBe('text-red-600')
    })

    it('should return green for large positive values', () => {
      expect(getPercentageColor(1000)).toBe('text-green-600')
    })

    it('should return red for large negative values', () => {
      expect(getPercentageColor(-1000)).toBe('text-red-600')
    })
  })
})
