import type { MetadataRoute } from 'next'
import { OPENINGS } from '@/lib/chess-data/openings'
import { PUZZLES } from '@/lib/chess-data/puzzles'
import { TRAPS } from '@/lib/chess-data/traps'

const BASE_URL = 'https://chessgrind.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/learn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  const openingPages: MetadataRoute.Sitemap = OPENINGS.map(o => ({
    url: `${BASE_URL}/learn/openings/${o.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const puzzlePages: MetadataRoute.Sitemap = PUZZLES.map(p => ({
    url: `${BASE_URL}/learn/puzzles/${p.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const trapPages: MetadataRoute.Sitemap = TRAPS.map(t => ({
    url: `${BASE_URL}/learn/traps/${t.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...openingPages, ...puzzlePages, ...trapPages]
}
