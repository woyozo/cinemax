import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: {
    default: 'Cinemax — Stream Movies & TV Shows',
    template: '%s | Cinemax',
  },
  description:
    'Watch the latest movies and TV shows online. Cinemax offers thousands of titles in HD quality.',
  keywords: ['movies', 'tv shows', 'streaming', 'watch online', 'films', 'series'],
  openGraph: {
    title: 'Cinemax — Stream Movies & TV Shows',
    description:
      'Watch the latest movies and TV shows online. Cinemax offers thousands of titles in HD quality.',
    type: 'website',
    siteName: 'Cinemax',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cinemax — Stream Movies & TV Shows',
    description: 'Watch the latest movies and TV shows online.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cinemax-dark text-white antialiased font-sans">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
