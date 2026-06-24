'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ChevronDown, Tv } from 'lucide-react'
import { PlayerMessage } from '@/types'
import { useCinemaxStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// ─── Provider Definitions ────────────────────────────────────────────────────

interface Provider {
  id: string
  name: string
  getMovieUrl: (tmdbId: number) => string
  getTVUrl: (tmdbId: number, season: number, episode: number) => string
}

const PROVIDERS: Provider[] = [
  {
    id: 'vidking',
    name: 'Vidking',
    getMovieUrl: (id) => `https://www.vidking.net/embed/movie/${id}?color=E50914&autoPlay=true`,
    getTVUrl: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=E50914&autoPlay=true&nextEpisode=true&episodeSelector=true`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    getTVUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: 'vidsrc2',
    name: 'VidSrc Pro',
    getMovieUrl: (id) => `https://vidsrc.pro/embed/movie/${id}`,
    getTVUrl: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTVUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    getMovieUrl: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    getTVUrl: (id, s, e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  mediaTitle?: string
  mediaPoster?: string | null
  startTime?: number
}

export function VideoPlayer({
  tmdbId,
  mediaType,
  season = 1,
  episode = 1,
  mediaTitle = '',
  mediaPoster = null,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [providerIndex, setProviderIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cinemax-provider')
      const idx = PROVIDERS.findIndex((p) => p.id === saved)
      return idx >= 0 ? idx : 0
    }
    return 0
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { addToHistory, updateProgress } = useCinemaxStore()

  const provider = PROVIDERS[providerIndex]
  const embedUrl =
    mediaType === 'movie'
      ? provider.getMovieUrl(tmdbId)
      : provider.getTVUrl(tmdbId, season, episode)

  // Reset loading when provider or episode changes
  useEffect(() => {
    setIsLoading(true)
    setError(false)
  }, [providerIndex, tmdbId, season, episode])

  // Save provider preference
  const switchProvider = (idx: number) => {
    setProviderIndex(idx)
    setDropdownOpen(false)
    localStorage.setItem('cinemax-provider', PROVIDERS[idx].id)
  }

  // Listen for Vidking progress events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.vidking.net') return
      try {
        const message: PlayerMessage = JSON.parse(event.data)
        if (message.type === 'PLAYER_EVENT') {
          const { event: playerEvent, duration, progress } = message.data
          if (playerEvent === 'timeupdate' && duration > 0) {
            updateProgress(tmdbId, mediaType, progress)
          }
          if (playerEvent === 'play' || playerEvent === 'timeupdate') {
            addToHistory({
              id: `${mediaType}-${tmdbId}`,
              user_id: '',
              media_id: tmdbId,
              media_type: mediaType,
              media_title: mediaTitle,
              media_poster: mediaPoster,
              progress,
              duration,
              season_number: mediaType === 'tv' ? season : null,
              episode_number: mediaType === 'tv' ? episode : null,
              last_watched_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })
          }
        }
      } catch { /* ignore */ }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [tmdbId, mediaType, season, episode, mediaTitle, mediaPoster, addToHistory, updateProgress])

  const handleRetry = () => {
    setError(false)
    setIsLoading(true)
    if (iframeRef.current) iframeRef.current.src = embedUrl
  }

  const handleNextProvider = () => {
    const next = (providerIndex + 1) % PROVIDERS.length
    switchProvider(next)
  }

  return (
    <div className="w-full space-y-3">
      {/* Provider Selector Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Source:</span>
          {PROVIDERS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => switchProvider(idx)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border',
                idx === providerIndex
                  ? 'bg-cinemax-red text-white border-cinemax-red'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {error && (
          <button
            onClick={handleNextProvider}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-lg hover:bg-amber-500/25 transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            Try next source
          </button>
        )}
      </div>

      {/* Player */}
      <div
        className="relative w-full bg-black rounded-xl overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Loading */}
        <AnimatePresence>
          {isLoading && !error && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-2 border-cinemax-red border-t-transparent rounded-full"
              />
              <p className="text-gray-500 text-xs">Loading {provider.name}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cinemax-dark-2 gap-4 p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-1">
                <Tv className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Not available on {provider.name}</p>
                <p className="text-gray-500 text-sm">Try a different source below</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {PROVIDERS.map((p, idx) => (
                  idx !== providerIndex && (
                    <button
                      key={p.id}
                      onClick={() => switchProvider(idx)}
                      className="px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white text-sm rounded-lg transition-colors"
                    >
                      {p.name}
                    </button>
                  )
                ))}
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 text-gray-500 hover:text-white text-xs transition-colors mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry {provider.name}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* iframe */}
        {!error && (
          <iframe
            ref={iframeRef}
            key={`${provider.id}-${tmdbId}-${season}-${episode}`}
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            title={mediaTitle || 'Video Player'}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setError(true)
            }}
          />
        )}
      </div>

      {/* Provider info */}
      <p className="text-gray-600 text-xs text-center">
        Watching via <span className="text-gray-500">{provider.name}</span> · Switch source if video doesn&apos;t load
      </p>
    </div>
  )
}
