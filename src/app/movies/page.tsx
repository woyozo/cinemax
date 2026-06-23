import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getTrendingMovies } from '@/lib/tmdb'
import { MovieRow } from '@/components/movie/MovieRow'
import { HeroBanner } from '@/components/movie/HeroBanner'
import { SkeletonHero, SkeletonRow } from '@/components/skeletons'

export const metadata: Metadata = {
  title: 'Movies',
  description: 'Browse thousands of movies in HD quality.',
}

export const dynamic = "force-dynamic"

async function MoviesContent() {
  const [trending, popular, topRated, nowPlaying, upcoming] = await Promise.all([
    getTrendingMovies('week'),
    getPopularMovies(),
    getTopRatedMovies(),
    getNowPlayingMovies(),
    getUpcomingMovies(),
  ])

  return (
    <>
      <HeroBanner items={trending.results} mediaType="movie" />
      <div className="relative z-10 -mt-12 pb-16 space-y-2">
        <MovieRow title="Trending This Week" items={trending.results} mediaType="movie" />
        <MovieRow title="Now Playing" items={nowPlaying.results} mediaType="movie" />
        <MovieRow title="Popular Movies" items={popular.results} mediaType="movie" />
        <MovieRow title="Top Rated" items={topRated.results} mediaType="movie" />
        <MovieRow title="Coming Soon" items={upcoming.results} mediaType="movie" />
      </div>
    </>
  )
}

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-cinemax-dark">
      <Suspense fallback={<><SkeletonHero /><div className="space-y-2 mt-4"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div></>}>
        <MoviesContent />
      </Suspense>
    </div>
  )
}
