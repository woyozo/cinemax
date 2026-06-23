'use client'

import { Bookmark, Heart } from 'lucide-react'
import { useCinemaxStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { WatchlistItem, FavoriteItem } from '@/types'

interface ActionButtonsProps {
  mediaId: number
  mediaType: 'movie' | 'tv'
  mediaTitle: string
  mediaPoster: string | null
  mediaBackdrop: string | null
  voteAverage: number
}

export function ActionButtons({
  mediaId,
  mediaType,
  mediaTitle,
  mediaPoster,
  mediaBackdrop,
  voteAverage,
}: ActionButtonsProps) {
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInFavorites,
    addToFavorites,
    removeFromFavorites,
  } = useCinemaxStore()

  const inWatchlist = isInWatchlist(mediaId, mediaType)
  const inFavorites = isInFavorites(mediaId, mediaType)

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(mediaId, mediaType)
    } else {
      const item: WatchlistItem = {
        id: `${mediaType}-${mediaId}`,
        user_id: '',
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
        media_backdrop: mediaBackdrop,
        vote_average: voteAverage,
        added_at: new Date().toISOString(),
      }
      addToWatchlist(item)
    }
  }

  const handleFavorites = () => {
    if (inFavorites) {
      removeFromFavorites(mediaId, mediaType)
    } else {
      const item: FavoriteItem = {
        id: `${mediaType}-${mediaId}`,
        user_id: '',
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
        media_backdrop: mediaBackdrop,
        vote_average: voteAverage,
        added_at: new Date().toISOString(),
      }
      addToFavorites(item)
    }
  }

  return (
    <>
      <button
        onClick={handleWatchlist}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 text-sm font-medium',
          inWatchlist
            ? 'bg-white/15 border-white/30 text-white'
            : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
        )}
        aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Bookmark className={cn('w-5 h-5', inWatchlist && 'fill-white')} />
        <span className="hidden sm:inline">{inWatchlist ? 'Saved' : 'Watchlist'}</span>
      </button>

      <button
        onClick={handleFavorites}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 text-sm font-medium',
          inFavorites
            ? 'bg-red-500/15 border-red-500/40 text-red-400'
            : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
        )}
        aria-label={inFavorites ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={cn('w-5 h-5', inFavorites && 'fill-red-400 text-red-400')} />
        <span className="hidden sm:inline">{inFavorites ? 'Favorited' : 'Favorite'}</span>
      </button>
    </>
  )
}
