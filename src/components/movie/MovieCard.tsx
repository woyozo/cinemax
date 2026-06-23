'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Star, Info, Heart } from 'lucide-react'
import { tmdbImageUrl, formatRating, formatYear, getVidkingMovieUrl } from '@/lib/tmdb'
import { cn } from '@/lib/utils'
import { Movie, TVShow } from '@/types'

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

  const type = mediaType || (isMovie(item) ? 'movie' : 'tv')
  const title = isMovie(item) ? item.title : (item as TVShow).name
  const date = isMovie(item) ? item.release_date : (item as TVShow).first_air_date
  const posterUrl = tmdbImageUrl(item.poster_path, 'w342')

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ zIndex: 20 }}
    >
      <Link href={`/${type}/${item.id}`}>
        <div className="relative aspect-poster rounded-lg overflow-hidden bg-cinemax-dark-3">
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          <Image
            src={posterUrl}
            alt={title || 'Movie poster'}
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

          {/* Gradient Overlay on Hover */}
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

          {/* Rating Badge */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-xs font-semibold text-yellow-400">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formatRating(item.vote_average)}
            </div>
          </div>

          {/* Type Badge */}
          {showType && (
            <div className="absolute top-2 left-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-cinemax-red text-white">
                {type === 'movie' ? 'Movie' : 'TV'}
              </span>
            </div>
          )}

          {/* Hover Actions */}
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
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/watch/${type}/${item.id}`
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Play
                  </button>
                  <button
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                    aria-label="Add to watchlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                    aria-label="More info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white text-xs font-semibold truncate">{title}</p>
                {date && (
                  <p className="text-gray-400 text-xs mt-0.5">{formatYear(date)}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  )
}
