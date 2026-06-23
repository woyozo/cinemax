'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Play, Star } from 'lucide-react'
import Image from 'next/image'
import { getTVSeasonDetails } from '@/lib/tmdb'
import { Season, Episode, SeasonDetail } from '@/types'
import { tmdbImageUrl, formatRuntime } from '@/lib/tmdb'
import { cn } from '@/lib/utils'

interface EpisodeSelectorProps {
  tvId: number
  seasons: Season[]
  currentSeason: number
  currentEpisode: number
  onSelect: (season: number, episode: number) => void
}

export function EpisodeSelector({
  tvId,
  seasons,
  currentSeason,
  currentEpisode,
  onSelect,
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason)
  const [seasonDetail, setSeasonDetail] = useState<SeasonDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false)

  const validSeasons = seasons.filter((s) => s.season_number > 0)

  useEffect(() => {
    async function loadSeason() {
      setLoading(true)
      try {
        const detail = await getTVSeasonDetails(tvId, selectedSeason)
        setSeasonDetail(detail)
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    loadSeason()
  }, [tvId, selectedSeason])

  const currentSeasonData = validSeasons.find((s) => s.season_number === selectedSeason)

  return (
    <div className="bg-cinemax-dark-2 rounded-xl border border-white/8 overflow-hidden">
      {/* Season Selector */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Episodes</h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-cinemax-dark-3 border border-white/10 rounded-lg text-sm text-white hover:border-white/20 transition-colors"
          >
            <span>{currentSeasonData?.name || `Season ${selectedSeason}`}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                seasonDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {seasonDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-1 z-20 bg-cinemax-dark-3 border border-white/10 rounded-lg overflow-hidden shadow-xl max-h-60 overflow-y-auto"
              >
                {validSeasons.map((season) => (
                  <button
                    key={season.season_number}
                    onClick={() => {
                      setSelectedSeason(season.season_number)
                      setSeasonDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm transition-colors',
                      season.season_number === selectedSeason
                        ? 'text-cinemax-red bg-cinemax-red/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {season.name}
                    <span className="text-gray-500 ml-2 text-xs">
                      {season.episode_count} episodes
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Episodes List */}
      <div className="overflow-y-auto max-h-96">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-cinemax-red border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {seasonDetail?.episodes.map((ep) => (
              <EpisodeItem
                key={ep.id}
                episode={ep}
                isCurrent={
                  selectedSeason === currentSeason && ep.episode_number === currentEpisode
                }
                onSelect={() => onSelect(selectedSeason, ep.episode_number)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EpisodeItem({
  episode,
  isCurrent,
  onSelect,
}: {
  episode: Episode
  isCurrent: boolean
  onSelect: () => void
}) {
  const [imageError, setImageError] = useState(false)
  const stillUrl = episode.still_path && !imageError
    ? tmdbImageUrl(episode.still_path, 'w185')
    : null

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex gap-3 p-3 text-left transition-colors hover:bg-white/5',
        isCurrent && 'bg-cinemax-red/8 border-l-2 border-cinemax-red'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-14 rounded-md overflow-hidden bg-cinemax-dark-3 flex-shrink-0">
        {stillUrl ? (
          <Image
            src={stillUrl}
            alt={episode.name}
            fill
            sizes="96px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-5 h-5 text-gray-600" />
          </div>
        )}
        {isCurrent && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-6 h-6 rounded-full bg-cinemax-red flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-1 left-1 text-[10px] font-bold bg-black/70 px-1 rounded text-white">
          E{episode.episode_number}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-cinemax-red' : 'text-white')}>
          {episode.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {episode.vote_average > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-yellow-400">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {episode.vote_average.toFixed(1)}
            </span>
          )}
          {episode.runtime && (
            <span className="text-xs text-gray-500">{formatRuntime(episode.runtime)}</span>
          )}
        </div>
        {episode.overview && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{episode.overview}</p>
        )}
      </div>
    </button>
  )
}
