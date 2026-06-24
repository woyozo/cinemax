'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ChevronRight, AlertCircle } from 'lucide-react'
import { PlayerMessage } from '@/types'
import { useCinemaxStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// ─── Provider Registry ────────────────────────────────────────────────────────

export interface Provider {
  id: string
  name: string
  badge?: string
  getMovieUrl: (tmdbId: number) => string
  getTVUrl: (tmdbId: number, season: number, episode: number) => string
}

export const PROVIDERS: Provider[] = [
  {
    id: 'vidking',
    name: 'Vidking',
    badge: 'Default',
    getMovieUrl: (id) =>
      `https://www.vidking.net/embed/movie/${id}?color=E50914&autoPlay=true`,
    getTVUrl: (id, s, e) =>
      `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=E50914&autoPlay=true&nextEpisode=true&episodeSelector=true`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    badge: '1080p',
    getMovieUrl: (id) =>
      `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&autoplay=1`,
    getTVUrl: (id, s, e) =>
      `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    badge: 'Multi',
    getMovieUrl: (id) =>
      `https://player.autoembed.cc/embed/movie/${id}`,
    getTVUrl: (id, s, e) =>
      `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    badge: '4K',
    getMovieUrl: (id) =>
      `https://vidlink.pro/movie/${id}?autoplay=true&title=true`,
    getTVUrl: (id, s, e) =>
      `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&title=true`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    badge: 'VIP',
    getMovieUrl: (id) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTVUrl: (id, s, e) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
]

const STORAGE_KEY = 'cinemax-provider-v2'

// ─── Component ────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  mediaTitle?: string
  mediaPoster?: string | null
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
  const [hasError, setHasError] = useState(false)
  const [providerIdx, setProviderIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem(STORAGE_KEY)
    const idx = PROVIDERS.findIndex((p) => p.id === saved)
    return idx >= 0 ? idx : 0
  })

  const { addToHistory, updateProgress } = useCinemaxStore()
  const provider = PROVIDERS[providerIdx]

  const embedUrl =
    mediaType === 'movie'
      ? provider.getMovieUrl(tmdbId)
      : provider.getTVUrl(tmdbId, season, episode)

  // Reset state when provider / episode / media changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
  }, [providerIdx, tmdbId, season, episode])

  const switchProvider = useCallback((idx: number) => {
    setProviderIdx(idx)
    localStorage.setItem(STORAGE_KEY, PROVIDERS[idx].id)
  }, [])

  const tryNextProvider = useCallback(() => {
    const next = (providerIdx + 1) % PROVIDERS.length
    switchProvider(next)
  }, [providerIdx, switchProvider])

  // Vidking postMessage progress tracking
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.vidking.net') return
      try {
        const msg: PlayerMessage = JSON.parse(event.data)
        if (msg.type !== 'PLAYER_EVENT') return
        const { event: ev, duration, progress } = msg.data
        if (ev === 'timeupdate' && duration > 0) {
          updateProgress(tmdbId, mediaType, progress)
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
      } catch { /* ignore non-JSON messages */ }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [tmdbId, mediaType, season, episode, mediaTitle, mediaPoster, addToHistory, updateProgress])

  return (
    <div className="w-full space-y-2">
      {/* ── Provider Tabs ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-gray-600 text-xs font-medium mr-1 hidden sm:block">Source:</span>
        {PROVIDERS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => switchProvider(idx)}
            className={cn(
              'relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5',
              idx === providerIdx
                ? 'bg-cinemax-red text-white border-cinemax-red shadow-lg shadow-red-900/30'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
            )}
          >
            {p.name}
            {p.badge && (
              <span className={cn(
                'text-[9px] px-1 py-0.5 rounded font-bold',
                idx === providerIdx ? 'bg-white/20 text-white' : 'bg-white/8 text-gray-500'
              )}>
                {p.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Player Frame ── */}
      <div
        className="relative w-full bg-black rounded-xl overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Loading spinner */}
        <AnimatePresence>
          {isLoading && !hasError && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-2 border-cinemax-red border-t-transparent rounded-full"
              />
              <p className="text-gray-600 text-xs">Loading {provider.name}…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f0f0f] gap-5 p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">
                  Not available on {provider.name}
                </p>
                <p className="text-gray-500 text-sm">Try a different source</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {PROVIDERS.map((p, idx) =>
                  idx !== providerIdx ? (
                    <button
                      key={p.id}
                      onClick={() => switchProvider(idx)}
                      className="px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white text-sm rounded-lg transition-colors"
                    >
                      {p.name}
                    </button>
                  ) : null
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={tryNextProvider}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cinemax-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Next source
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setHasError(false); setIsLoading(true) }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* iframe — NO sandbox attribute */}
        <iframe
          ref={iframeRef}
          key={`${provider.id}-${tmdbId}-${season}-${episode}`}
          src={embedUrl}
          className={cn('w-full h-full', hasError && 'invisible')}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          title={mediaTitle || 'Video Player'}
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true) }}
        />
      </div>

      {/* Footer hint */}
      <p className="text-gray-700 text-xs text-center">
        Source: <span className="text-gray-600">{provider.name}</span>
        {' · '}
        <button
          onClick={tryNextProvider}
          className="text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-2"
        >
          switch source
        </button>
        {' '}if video doesn&apos;t load
      </p>
    </div>
  )
}
