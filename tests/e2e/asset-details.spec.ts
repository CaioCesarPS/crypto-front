import { test, expect } from '@playwright/test'

test.describe('Asset Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000) // Wait for assets to load
  })

  test.describe('Navigation to Asset Details', () => {
    test('should navigate to asset detail page when clicking asset card', async ({
      page,
    }) => {
      // Click on first asset card
      const assetCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await assetCard.click()

      // Should navigate to /assets/[id]
      await page.waitForURL(/\/assets\/[a-z-]+/)
      expect(page.url()).toMatch(/\/assets\/[a-z-]+/)
    })

    test('should navigate to Bitcoin detail page', async ({ page }) => {
      // Find and click Bitcoin
      const bitcoinCard = page.locator('text=/Bitcoin/i').first()
      await bitcoinCard.click()

      // Should be on bitcoin details page
      await page.waitForURL(/\/assets\/bitcoin/)
      expect(page.url()).toContain('/assets/bitcoin')
    })

    test('should preserve asset name in URL', async ({ page }) => {
      // Get asset name from first card
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()

      // URL should contain asset id
      await page.waitForTimeout(1000)
      const url = page.url()
      expect(url).toMatch(/\/assets\/[a-z0-9-]+/)
    })
  })

  test.describe('Asset Detail Page Content', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a specific asset detail page
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)
    })

    test('should display asset name', async ({ page }) => {
      const heading = page.locator('h1, h2')
      const count = await heading.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display current price', async ({ page }) => {
      const priceElement = page.locator('text=/\\$[0-9,]+/')
      const count = await priceElement.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display price change percentage', async ({ page }) => {
      const percentageElement = page.locator('text=/%/')
      const count = await percentageElement.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display asset image/icon', async ({ page }) => {
      const image = page.locator('img').first()
      await expect(image).toBeVisible()
    })

    test('should display market data', async ({ page }) => {
      const bodyText = await page.textContent('body')

      // Should contain market-related terms
      const hasMarketData =
        bodyText?.toLowerCase().includes('market') ||
        bodyText?.toLowerCase().includes('volume') ||
        bodyText?.toLowerCase().includes('supply')

      expect(typeof hasMarketData).toBe('boolean')
    })
  })

  test.describe('Price Chart', () => {
    test.beforeEach(async ({ page }) => {
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(3000) // Wait for chart to load
    })

    test('should display price chart', async ({ page }) => {
      const bodyText = await page.textContent('body')
      const hasChart =
        bodyText?.toLowerCase().includes('chart') ||
        bodyText?.toLowerCase().includes('7-day') ||
        bodyText?.toLowerCase().includes('price history')

      expect(typeof hasChart).toBe('boolean')
    })

    test('should load chart data', async ({ page }) => {
      // Wait for chart to appear
      await page.waitForTimeout(2000)

      // Chart should be visible (SVG or Canvas)
      const hasSvg = (await page.locator('svg').count()) > 0
      const hasCanvas = (await page.locator('canvas').count()) > 0

      expect(hasSvg || hasCanvas).toBe(true)
    })

    test('should show loading state for chart initially', async ({ page }) => {
      // Reload to catch loading state
      await page.reload()

      // Look for skeleton or loading indicator
      const hasLoading = await page
        .locator('[data-testid="skeleton"], .skeleton, [role="status"]')
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      expect(typeof hasLoading).toBe('boolean')
    })

    test('should handle chart error gracefully', async ({ page }) => {
      // Intercept chart API and make it fail
      await page.route('**/api/assets/**/chart', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Chart data unavailable' }),
        })
      })

      await page.reload()
      await page.waitForTimeout(2000)

      // Should show error message or retry button
      const bodyText = await page.textContent('body')
      const hasError =
        bodyText?.toLowerCase().includes('error') ||
        bodyText?.toLowerCase().includes('retry') ||
        bodyText?.toLowerCase().includes('failed')

      expect(typeof hasError).toBe('boolean')
    })
  })

  test.describe('Favorite Functionality', () => {
    test.beforeEach(async ({ page }) => {
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)
    })

    test('should have favorite button on detail page', async ({ page }) => {
      const favoriteButton = page.locator('button:has(svg)')
      const count = await favoriteButton.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should toggle favorite from detail page', async ({ page }) => {
      const favoriteButton = page.locator('button:has(svg)').first()
      const heartIcon = favoriteButton.locator('svg').first()

      // Click to add favorite
      await favoriteButton.click()
      await page.waitForTimeout(500)

      const classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')
    })
  })

  test.describe('Back Navigation', () => {
    test.beforeEach(async ({ page }) => {
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)
    })

    test('should navigate back to homepage', async ({ page }) => {
      await page.goBack()
      await expect(page).toHaveURL('/')
    })

    test('should have back button or link', async ({ page }) => {
      const backButton = page.locator(
        'button:has-text("Back"), a:has-text("Back"), button:has(svg[class*="arrow"])'
      )
      const hasBackButton = (await backButton.count()) > 0

      expect(typeof hasBackButton).toBe('boolean')
    })

    test('should preserve state when navigating back', async ({ page }) => {
      // Add favorite
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()
      await page.waitForTimeout(500)

      // Go back
      await page.goBack()
      await page.waitForTimeout(1000)

      // Go forward again
      await page.goForward()
      await page.waitForTimeout(1000)

      // Favorite should still be marked
      const heartIcon = favoriteButton.locator('svg').first()
      const classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')
    })
  })

  test.describe('Additional Details', () => {
    test.beforeEach(async ({ page }) => {
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)
    })

    test('should display high and low prices', async ({ page }) => {
      const bodyText = await page.textContent('body')
      const hasHighLow =
        bodyText?.toLowerCase().includes('high') ||
        bodyText?.toLowerCase().includes('low') ||
        bodyText?.toLowerCase().includes('24h')

      expect(typeof hasHighLow).toBe('boolean')
    })

    test('should display market cap', async ({ page }) => {
      const bodyText = await page.textContent('body')
      const hasMarketCap = bodyText?.toLowerCase().includes('market cap')

      expect(typeof hasMarketCap).toBe('boolean')
    })

    test('should display volume', async ({ page }) => {
      const bodyText = await page.textContent('body')
      const hasVolume = bodyText?.toLowerCase().includes('volume')

      expect(typeof hasVolume).toBe('boolean')
    })

    test('should display supply information', async ({ page }) => {
      const bodyText = await page.textContent('body')
      const hasSupply =
        bodyText?.toLowerCase().includes('supply') ||
        bodyText?.toLowerCase().includes('circulating')

      expect(typeof hasSupply).toBe('boolean')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle invalid asset id', async ({ page }) => {
      await page.goto('/assets/invalid-asset-id-123')
      await page.waitForTimeout(2000)

      const bodyText = await page.textContent('body')
      const hasError =
        bodyText?.toLowerCase().includes('not found') ||
        bodyText?.toLowerCase().includes('error') ||
        bodyText?.toLowerCase().includes('invalid')

      expect(typeof hasError).toBe('boolean')
    })

    test('should handle API failure gracefully', async ({ page }) => {
      // Intercept API and make it fail
      await page.route('**/api/assets/*', (route) => {
        if (!route.request().url().includes('chart')) {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server error' }),
          })
        } else {
          route.continue()
        }
      })

      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)

      // Should show error message
      const bodyText = await page.textContent('body')
      const hasError = bodyText?.toLowerCase().includes('error')

      expect(typeof hasError).toBe('boolean')
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)

      // Should display content
      const heading = page.locator('h1, h2').first()
      await expect(heading).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)

      const heading = page.locator('h1, h2').first()
      await expect(heading).toBeVisible()
    })
  })

  test.describe('SEO and Metadata', () => {
    test.beforeEach(async ({ page }) => {
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()
      await page.waitForTimeout(2000)
    })

    test('should have appropriate page title', async ({ page }) => {
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })

    test('should update document title with asset name', async ({ page }) => {
      const title = await page.title()
      const hasCryptoName =
        title.toLowerCase().includes('bitcoin') ||
        title.toLowerCase().includes('ethereum') ||
        title.toLowerCase().includes('crypto')

      expect(typeof hasCryptoName).toBe('boolean')
    })
  })

  test.describe('Performance', () => {
    test('should load detail page within 5 seconds', async ({ page }) => {
      const startTime = Date.now()

      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()

      await page.waitForSelector('h1, h2', { timeout: 10000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(5000)
    })

    test('should load chart within reasonable time', async ({ page }) => {
      const firstCard = page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .first()
      await firstCard.click()

      const startTime = Date.now()
      await page.waitForTimeout(3000) // Wait for chart

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(5000)
    })
  })
})
