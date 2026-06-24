'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Star, Info } from 'lucide-react'
import { tmdbImageUrl, formatRating, formatYear } from '@/lib/tmdb'
import { cn } from '@/lib/utils'
import { Movie, TVShow } from '@/types'
import { useCinemaxStore } from '@/lib/store'
import { WatchlistItem, FavoriteItem } from '@/types'

type MediaItem = Movie | TVShow

function isMovie(item: MediaItem): item is Movie {
  return 'title' in item
}

interface MovieCardProps {
  item: MediaItem
  mediaType?: 'movie' | 'tv'
  priority?: boolean
  showType?: boolean
}

export function MovieCard({ item, mediaType, priority = false, showType = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useCinemaxStore()

  // FIX: use correct route paths (/movies/ and /tv-shows/)
  const type = mediaType || (isMovie(item) ? 'movie' : 'tv')
  const detailHref = type === 'movie' ? `/movies/${item.id}` : `/tv-shows/${item.id}`
  const watchHref  = type === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}?s=1&e=1`

  const title = isMovie(item) ? item.title : (item as TVShow).name
  const date  = isMovie(item) ? item.release_date : (item as TVShow).first_air_date
  const posterUrl = tmdbImageUrl(item.poster_path, 'w342')
  const inWatchlist = isInWatchlist(item.id, type)

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWatchlist) {
      removeFromWatchlist(item.id, type)
    } else {
      const wItem: WatchlistItem = {
        id: `${type}-${item.id}`,
        user_id: '',
        media_id: item.id,
        media_type: type,
        media_title: title || '',
        media_poster: item.poster_path,
        media_backdrop: item.backdrop_path,
        vote_average: item.vote_average,
        added_at: new Date().toISOString(),
      }
      addToWatchlist(wItem)
    }
  }

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ zIndex: 20 }}
    >
      {/* FIX: outer Link goes to detail page — no longer causes 404 */}
      <Link href={detailHref}>
        <div className="relative aspect-poster rounded-lg overflow-hidden bg-cinemax-dark-3">
          {/* Skeleton */}
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}

          <Image
            src={posterUrl}
            alt={title || 'Poster'}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 180px"
            className={cn(
              'object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              isHovered && 'scale-105'
            )}
            onLoad={() => setImageLoaded(true)}
            priority={priority}
          />

          {/* Hover gradient */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"
              />
            )}
          </AnimatePresence>

          {/* Rating */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-xs font-semibold text-yellow-400">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formatRating(item.vote_average)}
            </div>
          </div>

          {/* Type badge */}
          {showType && (
            <div className="absolute top-2 left-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-cinemax-red text-white">
                {type === 'movie' ? 'Movie' : 'TV'}
              </span>
            </div>
          )}

          {/* Hover action bar */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* Play — navigates to watch page */}
                  <Link
                    href={watchHref}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Play
                  </Link>

                  {/* Watchlist toggle */}
                  <button
                    onClick={handleWatchlistToggle}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      inWatchlist
                        ? 'bg-cinemax-red/80 hover:bg-cinemax-red'
                        : 'bg-white/10 hover:bg-white/20'
                    )}
                    aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <Plus className={cn('w-4 h-4', inWatchlist && 'rotate-45')} />
                  </button>

                  {/* Info */}
                  <Link
                    href={detailHref}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="More info"
                  >
                    <Info className="w-4 h-4" />
                  </Link>
                </div>

                <p className="text-white text-xs font-semibold truncate">{title}</p>
                {date && <p className="text-gray-400 text-xs mt-0.5">{formatYear(date)}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  )
}
