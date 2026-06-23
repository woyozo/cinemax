'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Filter } from 'lucide-react'
import { searchMulti } from '@/lib/tmdb'
import { tmdbImageUrl, formatRating, formatYear } from '@/lib/tmdb'
import { SearchResult } from '@/types'
import { debounce, getMediaTitle, getMediaDate, truncateText } from '@/lib/utils'
import { SkeletonSearchCard } from '@/components/skeletons'

type FilterType = 'all' | 'movie' | 'tv'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(
    async (q: string, p = 1, append = false) => {
      if (!q.trim()) {
        setResults([])
        setTotalPages(0)
        return
      }

      if (p === 1) setLoading(true)
      else setLoadingMore(true)

      try {
        const data = await searchMulti(q, p)
        const filtered = data.results.filter(
          (r) => r.media_type === 'movie' || r.media_type === 'tv'
        )
        if (append) {
          setResults((prev) => [...prev, ...filtered])
        } else {
          setResults(filtered)
        }
        setTotalPages(data.total_pages)
      } catch {
        //
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    []
  )

  const debouncedSearch = useCallback(
    debounce((q: string) => {
      setPage(1)
      doSearch(q, 1)
    }, 400),
    [doSearch]
  )

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    debouncedSearch(val)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
          const nextPage = page + 1
          setPage(nextPage)
          doSearch(query, nextPage, true)
        }
      },
      { threshold: 0.5 }
    )

    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [loadingMore, page, totalPages, query, doSearch])

  const filteredResults = filter === 'all'
    ? results
    : results.filter((r) => r.media_type === filter)

  const popularSearches = ['Action', 'Sci-Fi', 'Marvel', 'Breaking Bad', 'Game of Thrones', 'Horror']

  return (
    <div className="min-h-screen bg-cinemax-dark pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Search</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search movies, TV shows..."
            className="w-full pl-12 pr-12 py-4 bg-cinemax-dark-2 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-cinemax-dark-3 transition-all text-base"
            autoFocus
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Pills */}
        {results.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-gray-500" />
            {(['all', 'movie', 'tv'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-cinemax-red text-white'
                    : 'bg-white/8 text-gray-400 hover:bg-white/15 hover:text-white border border-white/10'
                }`}
              >
                {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        )}

        {/* Popular Searches (empty state) */}
        {!query && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term)
                    doSearch(term, 1)
                  }}
                  className="px-4 py-2 bg-cinemax-dark-2 border border-white/10 text-gray-300 hover:text-white hover:border-white/25 rounded-xl text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonSearchCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {!loading && filteredResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <p className="text-gray-500 text-sm mb-4">
                {filteredResults.length} results for &ldquo;{query}&rdquo;
              </p>
              {filteredResults.map((item, idx) => (
                <SearchResultItem key={`${item.id}-${idx}`} item={item} />
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <div className="w-6 h-6 border-2 border-cinemax-red border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {!loading && query && filteredResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-gray-400 text-lg mb-2">No results found</p>
            <p className="text-gray-600 text-sm">Try a different search term</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function SearchResultItem({ item }: { item: SearchResult }) {
  const title = getMediaTitle(item)
  const date = getMediaDate(item)
  const href = item.media_type === 'movie' ? `/movies/${item.id}` : `/tv-shows/${item.id}`
  const posterUrl = tmdbImageUrl(item.poster_path, 'w185')

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
      >
        {/* Poster */}
        <div className="w-14 h-20 rounded-lg overflow-hidden bg-cinemax-dark-3 flex-shrink-0 border border-white/8">
          {item.poster_path ? (
            <Image
              src={posterUrl}
              alt={title}
              width={56}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center px-1">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-medium text-sm group-hover:text-gray-200 transition-colors truncate">
              {title}
            </h3>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
              item.media_type === 'movie'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {item.media_type === 'movie' ? 'Movie' : 'TV'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 mb-2">
            {item.vote_average > 0 && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                {formatRating(item.vote_average)}
              </span>
            )}
            {date && (
              <span className="text-xs text-gray-500">{formatYear(date)}</span>
            )}
          </div>

          {item.overview && (
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
              {truncateText(item.overview, 120)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
