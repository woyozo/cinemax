'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { Movie, TVShow } from '@/types'
import { cn } from '@/lib/utils'

type MediaItem = Movie | TVShow

interface MovieRowProps {
  title: string
  items: MediaItem[]
  mediaType?: 'movie' | 'tv'
  showType?: boolean
  seeAllHref?: string
}

export function MovieRow({ title, items, mediaType, showType = false, seeAllHref }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    const row = rowRef.current
    if (!row) return

    const scrollAmount = row.clientWidth * 0.8
    row.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleScroll = () => {
    const row = rowRef.current
    if (!row) return
    setCanScrollLeft(row.scrollLeft > 0)
    setCanScrollRight(row.scrollLeft < row.scrollWidth - row.clientWidth - 10)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group/row mb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
        {seeAllHref && (
          <a
            href={seeAllHref}
            className="text-sm text-cinemax-red hover:text-red-400 transition-colors font-medium flex items-center gap-1"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-cinemax-dark to-transparent',
            'flex items-center justify-start pl-1',
            'transition-opacity duration-200',
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
            'group-hover/row:opacity-100'
          )}
          aria-label="Scroll left"
        >
          <div className="w-8 h-8 rounded-full bg-black/80 border border-white/10 flex items-center justify-center hover:bg-black transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Items */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{
                width: 'clamp(120px, 15vw, 180px)',
                scrollSnapAlign: 'start',
              }}
            >
              <MovieCard
                item={item}
                mediaType={mediaType}
                priority={index < 4}
                showType={showType}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-cinemax-dark to-transparent',
            'flex items-center justify-end pr-1',
            'transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
            'group-hover/row:opacity-100'
          )}
          aria-label="Scroll right"
        >
          <div className="w-8 h-8 rounded-full bg-black/80 border border-white/10 flex items-center justify-center hover:bg-black transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </motion.section>
  )
}
