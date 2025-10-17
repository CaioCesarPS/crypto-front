'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 mr-6"
        >
          <Coins className="h-6 w-6" />
          <span className="font-bold text-xl">Crypto Explorer</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link
            href="/"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/' ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            Explorer
          </Link>
          <Link
            href="/favorites"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/favorites'
                ? 'text-foreground'
                : 'text-foreground/60'
            )}
          >
            Favorites
          </Link>
        </nav>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
