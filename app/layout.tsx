import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Crypto Explorer - Track Top Cryptocurrencies',
    template: '%s | Crypto Explorer',
  },
  description:
    'Explore and track top cryptocurrencies by market cap. Monitor real-time prices, view detailed charts, and manage your favorite crypto assets.',
  keywords: [
    'cryptocurrency',
    'crypto tracker',
    'bitcoin',
    'ethereum',
    'crypto prices',
    'blockchain',
    'digital currency',
    'crypto portfolio',
  ],
  authors: [{ name: 'Crypto Explorer Team' }],
  creator: 'Crypto Explorer',
  publisher: 'Crypto Explorer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crypto-explorer.vercel.app',
    title: 'Crypto Explorer - Track Top Cryptocurrencies',
    description:
      'Explore and track top cryptocurrencies by market cap. Monitor real-time prices, view detailed charts, and manage your favorite crypto assets.',
    siteName: 'Crypto Explorer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Crypto Explorer - Track Top Cryptocurrencies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Explorer - Track Top Cryptocurrencies',
    description:
      'Explore and track top cryptocurrencies by market cap. Monitor real-time prices, view detailed charts, and manage your favorite crypto assets.',
    images: ['/og-image.png'],
    creator: '@cryptoexplorer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>{children}</ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
