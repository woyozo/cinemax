'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'
import { EpisodeSelector } from './EpisodeSelector'
import { MovieRow } from '@/components/movie/MovieRow'
import { TVDetail } from '@/types'

interface WatchPageClientProps {
  show: TVDetail
  tmdbId: number
  initialSeason: number
  initialEpisode: number
}

export function WatchPageClient({
  show,
  tmdbId,
  initialSeason,
  initialEpisode,
}: WatchPageClientProps) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason)
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode)

  const handleEpisodeSelect = (season: number, episode: number) => {
    setCurrentSeason(season)
    setCurrentEpisode(episode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || []

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/tv-shows/${tmdbId}`}
            className="p-2 rounded-lg hover:bg-white/8 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{show.name}</h1>
            <p className="text-gray-500 text-sm">
              Season {currentSeason} · Episode {currentEpisode}
            </p>
          </div>
        </div>
        <Link
          href={`/tv-shows/${tmdbId}`}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">Details</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player + Info */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            tmdbId={tmdbId}
            mediaType="tv"
            season={currentSeason}
            episode={currentEpisode}
            mediaTitle={show.name}
            mediaPoster={show.poster_path}
          />

          {/* Show Info */}
          <div className="p-5 bg-cinemax-dark-2 rounded-xl border border-white/8">
            <h2 className="text-white font-semibold mb-1">{show.name}</h2>
            <p className="text-gray-500 text-xs mb-2">
              Season {currentSeason} · Episode {currentEpisode} · {show.number_of_seasons} Seasons Total
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">{show.overview}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {show.genres?.map((g) => (
                <span key={g.id} className="genre-badge">{g.name}</span>
              ))}
            </div>
          </div>

          {/* Recommendations - Desktop */}
          {show.recommendations?.results && show.recommendations.results.length > 0 && (
            <div className="hidden lg:block">
              <MovieRow
                title="More Like This"
                items={show.recommendations.results}
                mediaType="tv"
              />
            </div>
          )}
        </div>

        {/* Sidebar - Episode Selector */}
        <div className="lg:col-span-1">
          {validSeasons.length > 0 && (
            <EpisodeSelector
              tvId={tmdbId}
              seasons={validSeasons}
              currentSeason={currentSeason}
              currentEpisode={currentEpisode}
              onSelect={handleEpisodeSelect}
            />
          )}
        </div>
      </div>

      {/* Recommendations - Mobile */}
      {show.recommendations?.results && show.recommendations.results.length > 0 && (
        <div className="lg:hidden mt-6">
          <MovieRow
            title="More Like This"
            items={show.recommendations.results}
            mediaType="tv"
          />
        </div>
      )}
    </div>
  )
}
