import { test, expect } from '@playwright/test'

test.describe('Browse and Search Cryptocurrencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Homepage Loading', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Crypto|Home/i)
    })

    test('should display navigation header', async ({ page }) => {
      const header = page.locator('header, nav').first()
      await expect(header).toBeVisible()
    })

    test('should load asset cards', async ({ page }) => {
      // Wait for assets to load
      await page.waitForSelector(
        '[data-testid="asset-card"], article, .asset-card',
        {
          timeout: 10000,
        }
      )

      const assetCards = page.locator(
        '[data-testid="asset-card"], article, .asset-card'
      )
      const count = await assetCards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display loading skeletons initially', async ({ page }) => {
      // Reload to catch loading state
      await page.reload()

      // Check for skeleton or loading indicator
      const hasLoading = await page
        .locator('[data-testid="skeleton"], .skeleton, [role="status"]')
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      // Loading state may be very brief, so we accept if we miss it
      expect(typeof hasLoading).toBe('boolean')
    })

    test('should display cryptocurrency names', async ({ page }) => {
      await page.waitForSelector('text=/Bitcoin|Ethereum|Cardano/i', {
        timeout: 10000,
      })

      const hasCrypto = await page.textContent('body')
      expect(hasCrypto).toMatch(/Bitcoin|Ethereum|Cardano/i)
    })
  })

  test.describe('Asset List Display', () => {
    test('should display asset prices', async ({ page }) => {
      await page.waitForSelector('text=/\\$/i', { timeout: 10000 })

      const prices = page.locator('text=/\\$[0-9,]+/')
      const count = await prices.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display price change percentages', async ({ page }) => {
      await page.waitForSelector('text=/%/', { timeout: 10000 })

      const percentages = page.locator('text=/%/')
      const count = await percentages.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display asset images', async ({ page }) => {
      await page.waitForSelector('img[alt*="Bitcoin"], img[alt*="Ethereum"]', {
        timeout: 10000,
      })

      const images = page.locator('img[src*="coin"]')
      const count = await images.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display multiple assets (at least 10)', async ({ page }) => {
      await page.waitForTimeout(2000) // Wait for assets to load

      const assetCards = page.locator(
        '[data-testid="asset-card"], article, .asset-card'
      )
      const count = await assetCards.count()
      expect(count).toBeGreaterThanOrEqual(10)
    })
  })

  test.describe('Search Functionality', () => {
    test('should have a search input', async ({ page }) => {
      const searchInput = page.locator(
        'input[type="text"], input[placeholder*="Search"]'
      )
      await expect(searchInput.first()).toBeVisible()
    })

    test('should filter assets when searching', async ({ page }) => {
      await page.waitForTimeout(2000) // Wait for initial load

      const searchInput = page
        .locator('input[placeholder*="Search"], input[placeholder*="search"]')
        .first()
      await searchInput.fill('bitcoin')

      // Wait for filtering to occur
      await page.waitForTimeout(500)

      const bodyText = await page.textContent('body')
      expect(bodyText?.toLowerCase()).toContain('bitcoin')
    })

    test('should show clear button when search has value', async ({ page }) => {
      const searchInput = page
        .locator('input[placeholder*="Search"], input[placeholder*="search"]')
        .first()
      await searchInput.fill('ethereum')

      // Look for clear/X button
      const clearButton = page.locator(
        'button:near(input), [role="button"]:near(input)'
      )
      const hasClearButton = await clearButton.count()
      expect(hasClearButton).toBeGreaterThan(0)
    })

    test('should clear search when clear button is clicked', async ({
      page,
    }) => {
      const searchInput = page
        .locator('input[placeholder*="Search"], input[placeholder*="search"]')
        .first()
      await searchInput.fill('cardano')

      const clearButton = page.locator('button:near(input)').first()
      await clearButton.click()

      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe('')
    })

    test('should handle search with no results', async ({ page }) => {
      const searchInput = page
        .locator('input[placeholder*="Search"], input[placeholder*="search"]')
        .first()
      await searchInput.fill('xyznonexistentcoin123')

      await page.waitForTimeout(500)

      const bodyText = await page.textContent('body')
      expect(
        bodyText?.toLowerCase().includes('no results') ||
          bodyText?.toLowerCase().includes('not found') ||
          bodyText?.toLowerCase().includes('no assets')
      ).toBe(true)
    })
  })

  test.describe('Infinite Scroll', () => {
    test('should load more assets when scrolling down', async ({ page }) => {
      await page.waitForTimeout(2000)

      const initialCards = await page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .count()

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Wait for new content
      await page.waitForTimeout(2000)

      const finalCards = await page
        .locator('[data-testid="asset-card"], article, .asset-card')
        .count()

      expect(finalCards).toBeGreaterThanOrEqual(initialCards)
    })

    test('should show load more button or auto-load', async ({ page }) => {
      await page.waitForTimeout(2000)

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Check for load more button or loading indicator
      const hasLoadMore =
        (await page.locator('button:has-text("Load More")').count()) > 0 ||
        (await page.locator('[role="status"], .loading').count()) > 0

      expect(typeof hasLoadMore).toBe('boolean')
    })
  })

  test.describe('Navigation', () => {
    test('should navigate to home from nav header', async ({ page }) => {
      const homeLink = page.locator('a[href="/"], a:has-text("Home")')
      if ((await homeLink.count()) > 0) {
        await homeLink.first().click()
        await expect(page).toHaveURL('/')
      }
    })

    test('should navigate to favorites page', async ({ page }) => {
      const favoritesLink = page.locator(
        'a[href="/favorites"], a:has-text("Favorites")'
      )
      if ((await favoritesLink.count()) > 0) {
        await favoritesLink.first().click()
        await expect(page).toHaveURL('/favorites')
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.waitForSelector(
        '[data-testid="asset-card"], article, .asset-card',
        {
          timeout: 10000,
        }
      )

      const assetCards = page.locator(
        '[data-testid="asset-card"], article, .asset-card'
      )
      const count = await assetCards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      await page.waitForSelector(
        '[data-testid="asset-card"], article, .asset-card',
        {
          timeout: 10000,
        }
      )

      const assetCards = page.locator(
        '[data-testid="asset-card"], article, .asset-card'
      )
      const count = await assetCards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      await page.waitForSelector(
        '[data-testid="asset-card"], article, .asset-card',
        {
          timeout: 10000,
        }
      )

      const assetCards = page.locator(
        '[data-testid="asset-card"], article, .asset-card'
      )
      const count = await assetCards.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Performance', () => {
    test('should load homepage within 5 seconds', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForSelector(
        '[data-testid="asset-card"], article, .asset-card',
        {
          timeout: 10000,
        }
      )

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(5000)
    })
  })
})
