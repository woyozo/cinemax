'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Movie, TVShow } from '@/types'
import { tmdbImageUrl, formatRating, formatYear } from '@/lib/tmdb'
import { truncateText } from '@/lib/utils'

type HeroItem = Movie | TVShow

function isMovie(item: HeroItem): item is Movie {
  return 'title' in item
}

interface HeroBannerProps {
  items: HeroItem[]
  mediaType?: 'movie' | 'tv'
}

export function HeroBanner({ items, mediaType = 'movie' }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const featured = items.slice(0, 5)

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [featured.length, isAutoPlaying])

  const item = featured[current]
  if (!item) return null

  const type = mediaType
  const title = isMovie(item) ? item.title : (item as TVShow).name
  const date  = isMovie(item) ? item.release_date : (item as TVShow).first_air_date

  // FIX: correct route paths for detail and watch
  const detailHref = type === 'movie' ? `/movies/${item.id}` : `/tv-shows/${item.id}`
  const watchHref  = type === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}?s=1&e=1`

  const backdropUrl = tmdbImageUrl(item.backdrop_path, 'original')

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
      {/* Backdrop images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={backdropUrl}
            alt={title || 'Hero backdrop'}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-gradient-bottom" />
      <div className="absolute inset-0 bg-gradient-to-t from-cinemax-dark via-transparent to-transparent opacity-40" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-16 sm:pb-20 lg:pb-24">
        <div className="px-4 sm:px-6 lg:px-16 max-w-2xl xl:max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 bg-cinemax-red text-white text-xs font-bold rounded-md uppercase tracking-wider">
                  {type === 'movie' ? 'Movie' : 'TV Show'}
                </span>
                <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {formatRating(item.vote_average)}
                </div>
                {date && <span className="text-gray-400 text-sm">{formatYear(date)}</span>}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-4 text-shadow">
                {title}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 max-w-xl text-shadow">
                {truncateText(item.overview, 200)}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {/* FIX: correct watch href */}
                <Link
                  href={watchHref}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base"
                >
                  <Play className="w-5 h-5 fill-black" />
                  Play Now
                </Link>
                {/* FIX: correct detail href */}
                <Link
                  href={detailHref}
                  className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/25 transition-all duration-200 border border-white/20 text-sm sm:text-base"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Link>
                <button className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/15">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 right-6 sm:right-8 lg:right-16 flex items-center gap-2">
        {featured.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setCurrent(idx); setIsAutoPlaying(false) }}
            className={`transition-all duration-300 rounded-full ${
              idx === current
                ? 'w-8 h-2 bg-cinemax-red'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Arrow nav */}
      <button
        onClick={() => { setCurrent((p) => (p - 1 + featured.length) % featured.length); setIsAutoPlaying(false) }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/10 transition-colors text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => { setCurrent((p) => (p + 1) % featured.length); setIsAutoPlaying(false) }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/10 transition-colors text-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
