/**
 * Jest setup file for integration tests
 * Provides necessary polyfills for Next.js API routes
 */

import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream } from 'stream/web'

// Polyfill for Web APIs not available in Node.js
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
})

// Mock fetch if not available
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}

// Suppress console errors in tests for cleaner output
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
