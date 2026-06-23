import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { getMovieDetails, getTVDetails } from '@/lib/tmdb'
import { VideoPlayer } from '@/components/player/VideoPlayer'
import { MovieRow } from '@/components/movie/MovieRow'
import { WatchPageClient } from '@/components/player/WatchPageClient'

interface PageProps {
  params: Promise<{ type: string; id: string }>
  searchParams: Promise<{ s?: string; e?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, id } = await params
  try {
    if (type === 'movie') {
      const movie = await getMovieDetails(Number(id))
      return { title: `Watch ${movie.title}` }
    } else {
      const show = await getTVDetails(Number(id))
      return { title: `Watch ${show.name}` }
    }
  } catch {
    return { title: 'Watch' }
  }
}

async function WatchContent({
  type,
  id,
  season,
  episode,
}: {
  type: string
  id: number
  season: number
  episode: number
}) {
  if (type !== 'movie' && type !== 'tv') notFound()

  if (type === 'movie') {
    const movie = await getMovieDetails(id).catch(() => null)
    if (!movie) notFound()

    return (
      <div className="min-h-screen bg-cinemax-dark pt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href={`/movies/${id}`}
                className="p-2 rounded-lg hover:bg-white/8 transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{movie.title}</h1>
                <p className="text-gray-500 text-sm">{movie.release_date?.split('-')[0]}</p>
              </div>
            </div>
            <Link
              href={`/movies/${id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </div>

          {/* Player */}
          <div className="mb-8">
            <VideoPlayer
              tmdbId={id}
              mediaType="movie"
              mediaTitle={movie.title}
              mediaPoster={movie.poster_path}
            />
          </div>

          {/* Movie Info */}
          <div className="mb-10 p-5 bg-cinemax-dark-2 rounded-xl border border-white/8">
            <h2 className="text-white font-semibold mb-2">{movie.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{movie.overview}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {movie.genres?.map((g) => (
                <span key={g.id} className="genre-badge">{g.name}</span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
            <MovieRow
              title="More Like This"
              items={movie.recommendations.results}
              mediaType="movie"
            />
          )}
        </div>
      </div>
    )
  }

  // TV Show
  const show = await getTVDetails(id).catch(() => null)
  if (!show) notFound()

  return (
    <div className="min-h-screen bg-cinemax-dark pt-20">
      <WatchPageClient
        show={show}
        tmdbId={id}
        initialSeason={season}
        initialEpisode={episode}
      />
    </div>
  )
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { type, id } = await params
  const { s, e } = await searchParams
  const season = Number(s) || 1
  const episode = Number(e) || 1

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cinemax-dark pt-20 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-cinemax-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WatchContent type={type} id={Number(id)} season={season} episode={episode} />
    </Suspense>
  )
}
