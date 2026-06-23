// TMDB Types
export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
  genres?: Genre[]
  runtime?: number
  tagline?: string
  status?: string
  budget?: number
  revenue?: number
  production_companies?: ProductionCompany[]
  spoken_languages?: SpokenLanguage[]
  belongs_to_collection?: Collection | null
  video?: boolean
  adult: boolean
}

export interface TVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
  genres?: Genre[]
  number_of_seasons?: number
  number_of_episodes?: number
  status?: string
  tagline?: string
  seasons?: Season[]
  episode_run_time?: number[]
  networks?: Network[]
}

export interface Season {
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  episode_count: number
  air_date: string
}

export interface Episode {
  id: number
  name: string
  overview: string
  still_path: string | null
  episode_number: number
  season_number: number
  air_date: string
  vote_average: number
  runtime: number | null
}

export interface SeasonDetail {
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  episodes: Episode[]
  air_date: string
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department: string
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Credits {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface SpokenLanguage {
  iso_639_1: string
  english_name: string
  name: string
}

export interface Collection {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
}

export interface Network {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface MovieDetail extends Movie {
  genres: Genre[]
  credits: Credits
  videos: { results: Video[] }
  recommendations: TMDBResponse<Movie>
  similar: TMDBResponse<Movie>
  runtime: number
  tagline: string
}

export interface TVDetail extends TVShow {
  genres: Genre[]
  credits: Credits
  videos: { results: Video[] }
  recommendations: TMDBResponse<TVShow>
  similar: TMDBResponse<TVShow>
  seasons: Season[]
  number_of_seasons: number
  number_of_episodes: number
}

// Supabase / App Types
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface WatchHistoryItem {
  id: string
  user_id: string
  media_id: number
  media_type: 'movie' | 'tv'
  media_title: string
  media_poster: string | null
  progress: number
  duration: number
  season_number: number | null
  episode_number: number | null
  last_watched_at: string
  created_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  media_id: number
  media_type: 'movie' | 'tv'
  media_title: string
  media_poster: string | null
  media_backdrop: string | null
  vote_average: number
  added_at: string
}

export interface FavoriteItem {
  id: string
  user_id: string
  media_id: number
  media_type: 'movie' | 'tv'
  media_title: string
  media_poster: string | null
  media_backdrop: string | null
  vote_average: number
  added_at: string
}

// Player Types
export interface PlayerMessage {
  type: string
  data: {
    event: 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked'
    currentTime: number
    duration: number
    progress: number
    id: string
    mediaType: 'movie' | 'tv'
    season?: number
    episode?: number
  }
}

export type MediaType = 'movie' | 'tv'

export interface SearchResult {
  id: number
  media_type: MediaType
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview: string
  genre_ids: number[]
  popularity: number
}
