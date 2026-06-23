import {
  Movie,
  TVShow,
  MovieDetail,
  TVDetail,
  TMDBResponse,
  SearchResult,
  SeasonDetail,
} from '@/types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const tmdbImageUrl = (
  path: string | null,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
  if (!path) return '/placeholder-poster.jpg'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!apiKey) {
    throw new Error('TMDB API key is not configured')
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    ...params,
  })

  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams}`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Movies
export async function getTrendingMovies(
  timeWindow: 'day' | 'week' = 'week'
): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`)
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/popular', {
    page: String(page),
  })
}

export async function getTopRatedMovies(page = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/top_rated', {
    page: String(page),
  })
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/now_playing', {
    page: String(page),
  })
}

export async function getUpcomingMovies(page = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/upcoming', {
    page: String(page),
  })
}

export async function getMovieDetails(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  })
}

// TV Shows
export async function getTrendingTV(
  timeWindow: 'day' | 'week' = 'week'
): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>(`/trending/tv/${timeWindow}`)
}

export async function getPopularTV(page = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/popular', {
    page: String(page),
  })
}

export async function getTopRatedTV(page = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/top_rated', {
    page: String(page),
  })
}

export async function getOnAirTV(page = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/on_the_air', {
    page: String(page),
  })
}

export async function getTVDetails(id: number): Promise<TVDetail> {
  return tmdbFetch<TVDetail>(`/tv/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  })
}

export async function getTVSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<SeasonDetail> {
  return tmdbFetch<SeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`)
}

// Search
export async function searchMulti(
  query: string,
  page = 1
): Promise<TMDBResponse<SearchResult>> {
  return tmdbFetch<TMDBResponse<SearchResult>>('/search/multi', {
    query,
    page: String(page),
    include_adult: 'false',
  })
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/search/movie', {
    query,
    page: String(page),
    include_adult: 'false',
  })
}

export async function searchTV(
  query: string,
  page = 1
): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/search/tv', {
    query,
    page: String(page),
    include_adult: 'false',
  })
}

// Discover
export async function discoverMovies(params: Record<string, string> = {}, page = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>('/discover/movie', {
    sort_by: 'popularity.desc',
    page: String(page),
    ...params,
  })
}

export async function discoverTV(params: Record<string, string> = {}, page = 1): Promise<TMDBResponse<TVShow>> {
  return tmdbFetch<TMDBResponse<TVShow>>('/discover/tv', {
    sort_by: 'popularity.desc',
    page: String(page),
    ...params,
  })
}

// Genres
export async function getMovieGenres() {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list')
}

export async function getTVGenres() {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/tv/list')
}

// Re-export utility formatters for convenience
export { formatRating, formatYear, formatRuntime, formatVoteCount } from '@/lib/utils'

// Vidking embed URL builder
export function getVidkingMovieUrl(
  tmdbId: number,
  options: {
    color?: string
    autoPlay?: boolean
    startTime?: number
  } = {}
): string {
  const params = new URLSearchParams()
  if (options.color) params.set('color', options.color)
  if (options.autoPlay) params.set('autoPlay', 'true')
  if (options.startTime) params.set('t', String(options.startTime))

  const base = `https://www.vidking.net/embed/movie/${tmdbId}`
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export function getVidkingTVUrl(
  tmdbId: number,
  season: number,
  episode: number,
  options: {
    color?: string
    autoPlay?: boolean
    nextEpisode?: boolean
    episodeSelector?: boolean
    startTime?: number
  } = {}
): string {
  const params = new URLSearchParams()
  if (options.color) params.set('color', options.color)
  if (options.autoPlay) params.set('autoPlay', 'true')
  if (options.nextEpisode) params.set('nextEpisode', 'true')
  if (options.episodeSelector) params.set('episodeSelector', 'true')
  if (options.startTime) params.set('t', String(options.startTime))

  const base = `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}`
  const query = params.toString()
  return query ? `${base}?${query}` : base
}
