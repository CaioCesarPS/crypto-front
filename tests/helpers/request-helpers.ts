/**
 * Helper functions for creating test requests
 */

import { NextRequest } from 'next/server'

/**
 * Creates a NextRequest for testing purposes
 * Handles the compatibility issues between NextRequest and the test environment
 */
export function createTestRequest(
  url: string,
  init?: RequestInit
): NextRequest {
  // Create a base Request object first
  const request = new Request(url, init)

  // Cast to NextRequest to satisfy type requirements
  // The Next.js API route handlers can work with standard Request objects
  return request as unknown as NextRequest
}
