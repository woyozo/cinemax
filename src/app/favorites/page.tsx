'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Play, Trash2, Star } from 'lucide-react'
import { useCinemaxStore } from '@/lib/store'
import { tmdbImageUrl, formatRating } from '@/lib/tmdb'

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useCinemaxStore()

  return (
    <div className="min-h-screen bg-cinemax-dark pt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-cinemax-red fill-cinemax-red" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Favorites</h1>
          <span className="ml-2 px-2.5 py-0.5 bg-white/10 text-gray-400 text-sm rounded-full">
            {favorites.length}
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-6">Heart movies and shows you love</p>
            <Link
              href="/"
              className="px-6 py-3 bg-cinemax-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <Link href={`/${item.media_type === 'movie' ? 'movies' : 'tv-shows'}/${item.media_id}`}>
                  <div className="aspect-poster rounded-lg overflow-hidden bg-cinemax-dark-3 relative">
                    {item.media_poster ? (
                      <Image
                        src={tmdbImageUrl(item.media_poster, 'w342')}
                        alt={item.media_title}
                        fill
                        sizes="(max-width: 640px) 45vw, 200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/watch/${item.media_type}/${item.media_id}`}
                        className="p-3 bg-cinemax-red rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="w-5 h-5 text-white fill-white" />
                      </Link>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-xs text-yellow-400 font-semibold">
                        <Star className="w-2.5 h-2.5 fill-yellow-400" />
                        {formatRating(item.vote_average)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        removeFromFavorites(item.media_id, item.media_type)
                      }}
                      className="absolute top-2 left-2 p-1.5 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </Link>
                <div className="mt-2">
                  <p className="text-white text-xs font-medium truncate">{item.media_title}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    item.media_type === 'movie' ? 'text-blue-400' : 'text-purple-400'
                  }`}>
                    {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
