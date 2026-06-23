import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Play, Plus, Heart, Star, Clock, Calendar, Globe } from 'lucide-react'
import { getMovieDetails, tmdbImageUrl } from '@/lib/tmdb'
import { formatRating, formatRuntime, formatYear, formatCurrency, formatVoteCount } from '@/lib/utils'
import { MovieRow } from '@/components/movie/MovieRow'
import { SkeletonDetails } from '@/components/skeletons'
import { CastRow } from '@/components/movie/CastRow'
import { TrailerSection } from '@/components/movie/TrailerSection'
import { ActionButtons } from '@/components/movie/ActionButtons'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const movie = await getMovieDetails(Number(id))
    return {
      title: movie.title,
      description: movie.overview,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: movie.backdrop_path ? [tmdbImageUrl(movie.backdrop_path, 'w780')] : [],
      },
    }
  } catch {
    return { title: 'Movie' }
  }
}

async function MovieDetailContent({ id }: { id: number }) {
  const movie = await getMovieDetails(id).catch(() => null)
  if (!movie) notFound()

  const backdropUrl = tmdbImageUrl(movie.backdrop_path, 'original')
  const posterUrl = tmdbImageUrl(movie.poster_path, 'w500')
  const trailer = movie.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  )
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')

  return (
    <div className="min-h-screen bg-cinemax-dark">
      {/* Backdrop */}
      <div className="relative h-[50vh] lg:h-[65vh]">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinemax-dark via-cinemax-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinemax-dark/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 lg:-mt-56 relative z-10 pb-20">
        <div className="flex flex-col sm:flex-row gap-6 lg:gap-10">
          {/* Poster */}
          <div className="hidden sm:block w-44 lg:w-64 flex-shrink-0">
            <div className="aspect-poster rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
              <Image
                src={posterUrl}
                alt={movie.title}
                width={256}
                height={384}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 lg:pt-20">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="genre-badge">{genre.name}</span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-gray-400 text-base italic mb-4">&ldquo;{movie.tagline}&rdquo;</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
              <div className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span>{formatRating(movie.vote_average)}</span>
                <span className="text-gray-500 font-normal">({formatVoteCount(movie.vote_count)})</span>
              </div>
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {formatRuntime(movie.runtime)}
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {formatYear(movie.release_date)}
                </div>
              )}
              <div className="px-2 py-0.5 text-xs font-semibold rounded bg-cinemax-red/20 text-cinemax-red border border-cinemax-red/30">
                HD
              </div>
            </div>

            {/* Overview */}
            <p className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base max-w-2xl">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Link
                href={`/watch/movie/${movie.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-cinemax-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </Link>
              <ActionButtons
                mediaId={movie.id}
                mediaType="movie"
                mediaTitle={movie.title}
                mediaPoster={movie.poster_path}
                mediaBackdrop={movie.backdrop_path}
                voteAverage={movie.vote_average}
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-cinemax-dark-2 rounded-xl border border-white/8">
              {director && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Director</p>
                  <p className="text-white text-sm font-medium">{director.name}</p>
                </div>
              )}
              {movie.status && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <p className="text-white text-sm font-medium">{movie.status}</p>
                </div>
              )}
              {(movie.budget ?? 0) > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Budget</p>
                  <p className="text-white text-sm font-medium">{formatCurrency(movie.budget ?? 0)}</p>
                </div>
              )}
              {(movie.revenue ?? 0) > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Revenue</p>
                  <p className="text-white text-sm font-medium">{formatCurrency(movie.revenue ?? 0)}</p>
                </div>
              )}
              {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Language</p>
                  <p className="text-white text-sm font-medium">
                    {movie.spoken_languages[0].english_name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="mt-8">
            <CastRow cast={movie.credits.cast} />
          </div>
        )}

        {/* Trailer */}
        {trailer && (
          <div className="mt-8">
            <TrailerSection trailerKey={trailer.key} title={movie.title} />
          </div>
        )}

        {/* Recommendations */}
        {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
          <div className="mt-8">
            <MovieRow
              title="More Like This"
              items={movie.recommendations.results}
              mediaType="movie"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<SkeletonDetails />}>
      <MovieDetailContent id={Number(id)} />
    </Suspense>
  )
}
