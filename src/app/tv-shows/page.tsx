import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPopularTV, getTopRatedTV, getOnAirTV, getTrendingTV } from '@/lib/tmdb'
import { MovieRow } from '@/components/movie/MovieRow'
import { HeroBanner } from '@/components/movie/HeroBanner'
import { SkeletonHero, SkeletonRow } from '@/components/skeletons'

export const metadata: Metadata = {
  title: 'TV Shows',
  description: 'Browse thousands of TV shows and series in HD quality.',
}

export const dynamic = "force-dynamic"

async function TVShowsContent() {
  const [trending, popular, topRated, onAir] = await Promise.all([
    getTrendingTV('week'),
    getPopularTV(),
    getTopRatedTV(),
    getOnAirTV(),
  ])

  return (
    <>
      <HeroBanner items={trending.results} mediaType="tv" />
      <div className="relative z-10 -mt-12 pb-16 space-y-2">
        <MovieRow title="Trending Shows" items={trending.results} mediaType="tv" />
        <MovieRow title="Currently Airing" items={onAir.results} mediaType="tv" />
        <MovieRow title="Popular Shows" items={popular.results} mediaType="tv" />
        <MovieRow title="Top Rated Shows" items={topRated.results} mediaType="tv" />
      </div>
    </>
  )
}

export default function TVShowsPage() {
  return (
    <div className="min-h-screen bg-cinemax-dark">
      <Suspense fallback={<><SkeletonHero /><div className="space-y-2 mt-4"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div></>}>
        <TVShowsContent />
      </Suspense>
    </div>
  )
}
