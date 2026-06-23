import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Play, Star, Clock, Calendar, Tv } from 'lucide-react'
import { getTVDetails, tmdbImageUrl } from '@/lib/tmdb'
import { formatRating, formatYear, formatVoteCount } from '@/lib/utils'
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
    const show = await getTVDetails(Number(id))
    return {
      title: show.name,
      description: show.overview,
      openGraph: {
        title: show.name,
        description: show.overview,
        images: show.backdrop_path ? [tmdbImageUrl(show.backdrop_path, 'w780')] : [],
      },
    }
  } catch {
    return { title: 'TV Show' }
  }
}

async function TVDetailContent({ id }: { id: number }) {
  const show = await getTVDetails(id).catch(() => null)
  if (!show) notFound()

  const backdropUrl = tmdbImageUrl(show.backdrop_path, 'original')
  const posterUrl = tmdbImageUrl(show.poster_path, 'w500')
  const trailer = show.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  )
  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || []

  return (
    <div className="min-h-screen bg-cinemax-dark">
      {/* Backdrop */}
      <div className="relative h-[50vh] lg:h-[65vh]">
        <Image
          src={backdropUrl}
          alt={show.name}
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
                alt={show.name}
                width={256}
                height={384}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 lg:pt-20">
            <div className="flex flex-wrap gap-2 mb-3">
              {show.genres?.map((genre) => (
                <span key={genre.id} className="genre-badge">{genre.name}</span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
              {show.name}
            </h1>

            {show.tagline && (
              <p className="text-gray-400 text-base italic mb-4">&ldquo;{show.tagline}&rdquo;</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
              <div className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span>{formatRating(show.vote_average)}</span>
                <span className="text-gray-500 font-normal">({formatVoteCount(show.vote_count)})</span>
              </div>
              {show.episode_run_time && show.episode_run_time[0] > 0 && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-4 h-4" />
                  ~{show.episode_run_time[0]}m / ep
                </div>
              )}
              {show.first_air_date && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {formatYear(show.first_air_date)}
                </div>
              )}
              {show.number_of_seasons && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Tv className="w-4 h-4" />
                  {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
                </div>
              )}
              <div className="px-2 py-0.5 text-xs font-semibold rounded bg-cinemax-red/20 text-cinemax-red border border-cinemax-red/30">
                HD
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base max-w-2xl">
              {show.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Link
                href={`/watch/tv/${show.id}?s=1&e=1`}
                className="flex items-center gap-2 px-6 py-3 bg-cinemax-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch S1E1
              </Link>
              <ActionButtons
                mediaId={show.id}
                mediaType="tv"
                mediaTitle={show.name}
                mediaPoster={show.poster_path}
                mediaBackdrop={show.backdrop_path}
                voteAverage={show.vote_average}
              />
            </div>

            {/* Seasons Grid */}
            {validSeasons.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {validSeasons.slice(0, 6).map((season) => (
                  <Link
                    key={season.season_number}
                    href={`/watch/tv/${show.id}?s=${season.season_number}&e=1`}
                    className="flex items-center gap-3 p-3 bg-cinemax-dark-2 border border-white/8 rounded-lg hover:border-white/20 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-cinemax-dark-3 flex-shrink-0">
                      {season.poster_path ? (
                        <Image
                          src={tmdbImageUrl(season.poster_path, 'w92')}
                          alt={season.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tv className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{season.name}</p>
                      <p className="text-gray-500 text-xs">{season.episode_count} eps</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-cinemax-dark-2 rounded-xl border border-white/8">
              {show.status && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <p className="text-white text-sm font-medium">{show.status}</p>
                </div>
              )}
              {show.number_of_episodes && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Episodes</p>
                  <p className="text-white text-sm font-medium">{show.number_of_episodes}</p>
                </div>
              )}
              {show.networks && show.networks.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Network</p>
                  <p className="text-white text-sm font-medium">{show.networks[0].name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <div className="mt-8">
            <CastRow cast={show.credits.cast} />
          </div>
        )}

        {/* Trailer */}
        {trailer && (
          <div className="mt-8">
            <TrailerSection trailerKey={trailer.key} title={show.name} />
          </div>
        )}

        {/* Recommendations */}
        {show.recommendations?.results && show.recommendations.results.length > 0 && (
          <div className="mt-8">
            <MovieRow
              title="More Like This"
              items={show.recommendations.results}
              mediaType="tv"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default async function TVShowPage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<SkeletonDetails />}>
      <TVDetailContent id={Number(id)} />
    </Suspense>
  )
}
