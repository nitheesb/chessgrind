import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

const BASE_URL = 'https://chess-vault.vercel.app'
const SITE_NAME = 'ChessVault'
const TITLE = 'ChessVault — Master Chess Through Play'
const DESCRIPTION =
  'Free interactive chess learning platform. Solve 50+ tactical puzzles, study 30+ openings with animated boards, master deadly traps, and play against AI from beginner to grandmaster level. Track your XP, unlock achievements, and improve your rating.'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: [
    'chess',
    'chess puzzles',
    'chess openings',
    'chess traps',
    'learn chess online',
    'chess tactics',
    'chess training',
    'chess AI',
    'play chess',
    'chess for beginners',
    'chess strategy',
    'gamified chess',
    'chess XP',
    'chess achievements',
    'interactive chess',
    'chess practice',
    'free chess',
    'chess lessons',
    'improve chess',
    'chess rating',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  referrer: 'origin-when-cross-origin',
  category: 'games',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },

  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
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

  alternates: {
    canonical: BASE_URL,
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },

  verification: {
    google: 'google41a41efec9c24141',
  },

  other: {
    'google-site-verification': 'google41a41efec9c24141',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#060710' },
    { media: '(prefers-color-scheme: light)', color: '#060710' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

// JSON-LD structured data for rich search results
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: BASE_URL,
        description: DESCRIPTION,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '120',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: [
          'Interactive chess puzzles',
          'Opening explorer with animated boards',
          'Chess trap lessons',
          'AI opponent (beginner to grandmaster)',
          'XP and achievement system',
          'Daily challenges and combo system',
          'Progress tracking and analytics',
        ],
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        logo: `${BASE_URL}/icon.svg`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is ChessVault free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, ChessVault is completely free. All puzzles, openings, traps, and AI play are available at no cost.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do chess puzzles work on ChessVault?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ChessVault offers 50+ tactical puzzles across categories like forks, pins, skewers, and checkmates. Each puzzle rewards XP, with bonus multipliers for combos and perfect solves.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I learn chess openings on ChessVault?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, ChessVault features 30+ openings with interactive animated boards showing each move, including the Sicilian Defense, Queen\'s Gambit, Italian Game, and more.',
            },
          },
          {
            '@type': 'Question',
            name: 'What skill level is ChessVault for?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ChessVault is designed for all skill levels — from complete beginners to advanced players. The AI adjusts from beginner to grandmaster difficulty, and content is organized by complexity.',
            },
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd />
        <link rel="canonical" href={BASE_URL} />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased overflow-x-hidden`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
