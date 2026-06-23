import { Suspense } from 'react'
import { HeroBanner } from '@/components/movie/HeroBanner'
import { MovieRow } from '@/components/movie/MovieRow'
import { SkeletonHero, SkeletonRow } from '@/components/skeletons'
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTV,
  getTrendingTV,
} from '@/lib/tmdb'

export const dynamic = "force-dynamic"

async function HomeContent() {
  const [trendingMovies, popularMovies, topRatedMovies, popularTV, trendingTV] =
    await Promise.all([
      getTrendingMovies('week'),
      getPopularMovies(),
      getTopRatedMovies(),
      getPopularTV(),
      getTrendingTV('week'),
    ])

  return (
    <>
      <HeroBanner items={trendingMovies.results} mediaType="movie" />

      <div className="relative z-10 -mt-12 pb-16 space-y-2">
        <MovieRow
          title="Trending Movies"
          items={trendingMovies.results}
          mediaType="movie"
          seeAllHref="/movies"
        />
        <MovieRow
          title="Popular TV Shows"
          items={popularTV.results}
          mediaType="tv"
          seeAllHref="/tv-shows"
        />
        <MovieRow
          title="Popular Movies"
          items={popularMovies.results}
          mediaType="movie"
          seeAllHref="/movies"
        />
        <MovieRow
          title="Top Rated Movies"
          items={topRatedMovies.results}
          mediaType="movie"
          seeAllHref="/movies"
        />
        <MovieRow
          title="Trending TV Shows"
          items={trendingTV.results}
          mediaType="tv"
          seeAllHref="/tv-shows"
        />
      </div>
    </>
  )
}

function HomeFallback() {
  return (
    <>
      <SkeletonHero />
      <div className="relative z-10 -mt-12 pb-16 space-y-2">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cinemax-dark">
      <Suspense fallback={<HomeFallback />}>
        <HomeContent />
      </Suspense>
    </div>
  )
}
