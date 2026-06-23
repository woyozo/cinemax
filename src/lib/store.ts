import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WatchHistoryItem, WatchlistItem, FavoriteItem, UserProfile } from '@/types'

interface CinemaxStore {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void

  // Watch History
  watchHistory: WatchHistoryItem[]
  addToHistory: (item: WatchHistoryItem) => void
  updateProgress: (mediaId: number, mediaType: string, progress: number) => void
  clearHistory: () => void

  // Watchlist
  watchlist: WatchlistItem[]
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (mediaId: number, mediaType: string) => void
  isInWatchlist: (mediaId: number, mediaType: string) => boolean

  // Favorites
  favorites: FavoriteItem[]
  addToFavorites: (item: FavoriteItem) => void
  removeFromFavorites: (mediaId: number, mediaType: string) => void
  isInFavorites: (mediaId: number, mediaType: string) => boolean
}

export const useCinemaxStore = create<CinemaxStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      watchHistory: [],
      addToHistory: (item) =>
        set((state) => {
          const existing = state.watchHistory.findIndex(
            (h) => h.media_id === item.media_id && h.media_type === item.media_type
          )
          if (existing !== -1) {
            const updated = [...state.watchHistory]
            updated[existing] = { ...updated[existing], ...item }
            return { watchHistory: updated }
          }
          return { watchHistory: [item, ...state.watchHistory].slice(0, 100) }
        }),
      updateProgress: (mediaId, mediaType, progress) =>
        set((state) => ({
          watchHistory: state.watchHistory.map((item) =>
            item.media_id === mediaId && item.media_type === mediaType
              ? { ...item, progress, last_watched_at: new Date().toISOString() }
              : item
          ),
        })),
      clearHistory: () => set({ watchHistory: [] }),

      watchlist: [],
      addToWatchlist: (item) =>
        set((state) => ({
          watchlist: [item, ...state.watchlist],
        })),
      removeFromWatchlist: (mediaId, mediaType) =>
        set((state) => ({
          watchlist: state.watchlist.filter(
            (item) => !(item.media_id === mediaId && item.media_type === mediaType)
          ),
        })),
      isInWatchlist: (mediaId, mediaType) =>
        get().watchlist.some(
          (item) => item.media_id === mediaId && item.media_type === mediaType
        ),

      favorites: [],
      addToFavorites: (item) =>
        set((state) => ({
          favorites: [item, ...state.favorites],
        })),
      removeFromFavorites: (mediaId, mediaType) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (item) => !(item.media_id === mediaId && item.media_type === mediaType)
          ),
        })),
      isInFavorites: (mediaId, mediaType) =>
        get().favorites.some(
          (item) => item.media_id === mediaId && item.media_type === mediaType
        ),
    }),
    {
      name: 'cinemax-storage',
      partialize: (state) => ({
        watchHistory: state.watchHistory,
        watchlist: state.watchlist,
        favorites: state.favorites,
      }),
    }
  )
)
