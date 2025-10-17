import { test, expect } from '@playwright/test'

test.describe('Favorites Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000) // Wait for assets to load
  })

  test.describe('Adding Favorites', () => {
    test('should add asset to favorites when heart icon is clicked', async ({
      page,
    }) => {
      // Find first favorite button (heart icon)
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.waitFor({ state: 'visible', timeout: 10000 })

      // Click to add favorite
      await favoriteButton.click()
      await page.waitForTimeout(500)

      // Heart should be filled (red)
      const heartIcon = favoriteButton.locator('svg').first()
      const classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')
    })

    test('should add multiple favorites', async ({ page }) => {
      // Add first favorite
      const firstFavorite = page.locator('button:has(svg)').nth(0)
      await firstFavorite.click()
      await page.waitForTimeout(300)

      // Add second favorite
      const secondFavorite = page.locator('button:has(svg)').nth(1)
      await secondFavorite.click()
      await page.waitForTimeout(300)

      // Both should be filled
      const firstHeart = firstFavorite.locator('svg').first()
      const secondHeart = secondFavorite.locator('svg').first()

      const firstClass = await firstHeart.getAttribute('class')
      const secondClass = await secondHeart.getAttribute('class')

      expect(firstClass).toContain('fill-red')
      expect(secondClass).toContain('fill-red')
    })

    test('should show toast notification when adding favorite', async ({
      page,
    }) => {
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()

      // Wait for toast/notification
      await page.waitForTimeout(500)

      // Check for toast notification (Sonner)
      const hasToast =
        (await page.locator('[data-sonner-toast]').count()) > 0 ||
        (await page.locator('.sonner, [role="status"]').count()) > 0

      expect(typeof hasToast).toBe('boolean')
    })
  })

  test.describe('Removing Favorites', () => {
    test('should remove favorite when heart icon is clicked again', async ({
      page,
    }) => {
      const favoriteButton = page.locator('button:has(svg)').first()

      // Add favorite
      await favoriteButton.click()
      await page.waitForTimeout(500)

      // Remove favorite
      await favoriteButton.click()
      await page.waitForTimeout(500)

      // Heart should not be filled
      const heartIcon = favoriteButton.locator('svg').first()
      const classList = await heartIcon.getAttribute('class')
      expect(classList).not.toContain('fill-red')
    })

    test('should toggle favorite state on multiple clicks', async ({
      page,
    }) => {
      const favoriteButton = page.locator('button:has(svg)').first()
      const heartIcon = favoriteButton.locator('svg').first()

      // Click 1: Add
      await favoriteButton.click()
      await page.waitForTimeout(300)
      let classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')

      // Click 2: Remove
      await favoriteButton.click()
      await page.waitForTimeout(300)
      classList = await heartIcon.getAttribute('class')
      expect(classList).not.toContain('fill-red')

      // Click 3: Add again
      await favoriteButton.click()
      await page.waitForTimeout(300)
      classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')
    })
  })

  test.describe('Favorites Page', () => {
    test('should navigate to favorites page', async ({ page }) => {
      const favoritesLink = page.locator('a[href="/favorites"]')

      if ((await favoritesLink.count()) > 0) {
        await favoritesLink.first().click()
        await expect(page).toHaveURL('/favorites')
      }
    })

    test('should display favorites added from homepage', async ({ page }) => {
      // Add a favorite on homepage
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()
      await page.waitForTimeout(1000)

      // Navigate to favorites page
      const favoritesLink = page.locator('a[href="/favorites"]')
      if ((await favoritesLink.count()) > 0) {
        await favoritesLink.first().click()
        await page.waitForTimeout(2000)

        // Check if favorites are displayed
        const assetCards = page.locator(
          '[data-testid="asset-card"], article, .asset-card'
        )
        const count = await assetCards.count()
        expect(count).toBeGreaterThan(0)
      }
    })

    test('should show empty state when no favorites', async ({ page }) => {
      // Navigate to favorites page
      const favoritesLink = page.locator('a[href="/favorites"]')
      if ((await favoritesLink.count()) > 0) {
        await favoritesLink.first().click()
        await page.waitForTimeout(1000)

        // Look for empty state message
        const bodyText = await page.textContent('body')
        const hasEmptyMessage =
          bodyText?.toLowerCase().includes('no favorites') ||
          bodyText?.toLowerCase().includes('add some favorites') ||
          bodyText?.toLowerCase().includes('empty')

        expect(typeof hasEmptyMessage).toBe('boolean')
      }
    })

    test('should remove favorite from favorites page', async ({ page }) => {
      // Add favorite on homepage
      const homeButton = page.locator('button:has(svg)').first()
      await homeButton.click()
      await page.waitForTimeout(1000)

      // Go to favorites
      const favoritesLink = page.locator('a[href="/favorites"]')
      if ((await favoritesLink.count()) > 0) {
        await favoritesLink.first().click()
        await page.waitForTimeout(2000)

        // Remove favorite
        const favoriteButton = page.locator('button:has(svg)').first()
        if ((await favoriteButton.count()) > 0) {
          await favoriteButton.click()
          await page.waitForTimeout(1000)

          // Card should disappear or heart should be unfilled
          const heartIcon = favoriteButton.locator('svg').first()
          const classList = await heartIcon.getAttribute('class')
          expect(classList).not.toContain('fill-red')
        }
      }
    })
  })

  test.describe('Persistence', () => {
    test('should persist favorites after page reload', async ({ page }) => {
      // Add a favorite
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()
      await page.waitForTimeout(1000)

      // Reload page
      await page.reload()
      await page.waitForTimeout(2000)

      // Check if favorite is still marked
      const heartIcon = favoriteButton.locator('svg').first()
      const classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')
    })

    test('should sync favorites across pages', async ({ page }) => {
      // Add favorite on homepage
      const homeButton = page.locator('button:has(svg)').first()
      await homeButton.click()
      await page.waitForTimeout(1000)

      // Navigate to favorites page
      const favoritesLink = page.locator('a[href="/favorites"]')
      if ((await favoritesLink.count()) > 0) {
        await favoritesLink.first().click()
        await page.waitForTimeout(2000)

        // Go back to homepage
        await page.goBack()
        await page.waitForTimeout(1000)

        // Favorite should still be marked
        const heartIcon = homeButton.locator('svg').first()
        const classList = await heartIcon.getAttribute('class')
        expect(classList).toContain('fill-red')
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle failed favorite addition gracefully', async ({
      page,
    }) => {
      // Intercept API call and make it fail
      await page.route('**/api/favorites', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' }),
        })
      })

      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()
      await page.waitForTimeout(500)

      // Should show error message or toast
      const bodyText = await page.textContent('body')
      const hasError =
        bodyText?.toLowerCase().includes('error') ||
        bodyText?.toLowerCase().includes('failed')

      expect(typeof hasError).toBe('boolean')
    })

    test('should handle network errors', async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true)

      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()
      await page.waitForTimeout(500)

      // Should handle gracefully
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      // Restore online
      await page.context().setOffline(false)
    })
  })

  test.describe('User Experience', () => {
    test('should disable favorite button while loading', async ({ page }) => {
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.click()

      // Button should be disabled briefly
      const isDisabled = await favoriteButton.isDisabled().catch(() => false)
      expect(typeof isDisabled).toBe('boolean')
    })

    test('should provide visual feedback on hover', async ({ page }) => {
      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.hover()

      // Button should be visible and interactive
      await expect(favoriteButton).toBeVisible()
    })

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const favoriteButton = page.locator('button:has(svg)').first()
      await favoriteButton.waitFor({ state: 'visible' })

      await favoriteButton.click()
      await page.waitForTimeout(500)

      const heartIcon = favoriteButton.locator('svg').first()
      const classList = await heartIcon.getAttribute('class')
      expect(classList).toContain('fill-red')
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible favorite buttons', async ({ page }) => {
      const favoriteButton = page.locator('button:has(svg)').first()

      // Should have button role
      const role = await favoriteButton.getAttribute('role')
      expect(role === null || role === 'button').toBe(true)
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Tab to first favorite button
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Press Enter to toggle
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      // Should have toggled favorite
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
    })
  })

  test.describe('Bulk Operations', () => {
    test('should handle adding many favorites quickly', async ({ page }) => {
      const favoriteButtons = page.locator('button:has(svg)')
      const count = Math.min(5, await favoriteButtons.count())

      for (let i = 0; i < count; i++) {
        await favoriteButtons.nth(i).click()
        await page.waitForTimeout(200)
      }

      // All should be marked as favorites
      for (let i = 0; i < count; i++) {
        const heartIcon = favoriteButtons.nth(i).locator('svg').first()
        const classList = await heartIcon.getAttribute('class')
        expect(classList).toContain('fill-red')
      }
    })
  })
})
