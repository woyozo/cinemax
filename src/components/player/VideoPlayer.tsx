'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, RefreshCw } from 'lucide-react'
import { getVidkingMovieUrl, getVidkingTVUrl } from '@/lib/tmdb'
import { PlayerMessage } from '@/types'
import { useCinemaxStore } from '@/lib/store'

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
  startTime,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const { addToHistory, updateProgress } = useCinemaxStore()

  const embedUrl =
    mediaType === 'movie'
      ? getVidkingMovieUrl(tmdbId, {
          color: 'E50914',
          autoPlay: true,
          startTime,
        })
      : getVidkingTVUrl(tmdbId, season, episode, {
          color: 'E50914',
          autoPlay: true,
          nextEpisode: true,
          episodeSelector: true,
          startTime,
        })

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.vidking.net') return

      try {
        const message: PlayerMessage = JSON.parse(event.data)
        if (message.type === 'PLAYER_EVENT') {
          const { event: playerEvent, currentTime, duration, progress } = message.data

          if (playerEvent === 'timeupdate' && duration > 0) {
            updateProgress(tmdbId, mediaType, progress)
          }

          if (playerEvent === 'play' || playerEvent === 'timeupdate') {
            const historyItem = {
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
            }
            addToHistory(historyItem)
          }
        }
      } catch {
        // Not a JSON message from player
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [tmdbId, mediaType, season, episode, mediaTitle, mediaPoster, addToHistory, updateProgress])

  const handleFullscreen = () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  const handleRetry = () => {
    setError(false)
    setIsLoading(true)
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-2 border-cinemax-red border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cinemax-dark-2 gap-4">
          <p className="text-gray-400 text-sm">Failed to load player</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-cinemax-red text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Player iframe */}
      <iframe
        ref={iframeRef}
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

      {/* Fullscreen Button */}
      <button
        onClick={handleFullscreen}
        className="absolute bottom-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors text-white opacity-0 hover:opacity-100 group-hover:opacity-100"
        aria-label="Fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  )
}
