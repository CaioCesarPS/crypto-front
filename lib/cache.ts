/**
 * Cache utility for API routes
 * Provides a shared cache mechanism that can be used in routes and tested independently
 */

import type { CryptoAsset } from '@/lib/types'

export interface CacheEntry {
  data: CryptoAsset[]
  timestamp: number
}

export class ApiCache {
  private cache = new Map<string, CacheEntry>()
  private cacheDuration: number

  constructor(cacheDuration = 60 * 1000) {
    this.cacheDuration = cacheDuration
  }

  get(key: string): CacheEntry | undefined {
    return this.cache.get(key)
  }

  set(key: string, entry: CacheEntry): void {
    this.cache.set(key, entry)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  isValid(entry: CacheEntry | undefined): boolean {
    if (!entry) return false
    return Date.now() - entry.timestamp < this.cacheDuration
  }

  get size(): number {
    return this.cache.size
  }

  keys(): IterableIterator<string> {
    return this.cache.keys()
  }
}

// Singleton instance for assets cache - increased to 5 minutes for rate limit protection
export const assetsCache = new ApiCache(5 * 60 * 1000) // 5 minutes
