# 🎬 Cinemax — Netflix-Inspired Streaming Platform

A production-ready movie streaming platform built with Next.js 15, Supabase, TMDB API, and Vidking Player embeds.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Animations | Framer Motion |
| Auth + DB | Supabase |
| Data | TMDB API |
| Player | Vidking (vidking.net embeds) |
| State | Zustand (with localStorage persistence) |
| Deploy | Vercel + Supabase Cloud |

---

## 📁 Project Structure

```
cinemax/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── not-found.tsx             # 404 page
│   │   ├── movies/
│   │   │   ├── page.tsx              # Browse movies
│   │   │   └── [id]/page.tsx         # Movie detail
│   │   ├── tv-shows/
│   │   │   ├── page.tsx              # Browse TV shows
│   │   │   └── [id]/page.tsx         # TV show detail
│   │   ├── watch/
│   │   │   └── [type]/[id]/page.tsx  # Watch page (movie/tv)
│   │   ├── search/
│   │   │   └── page.tsx              # Search with infinite scroll
│   │   ├── login/
│   │   │   └── page.tsx              # Google OAuth login
│   │   ├── profile/
│   │   │   └── page.tsx              # User profile
│   │   ├── watchlist/
│   │   │   └── page.tsx              # Saved watchlist
│   │   ├── favorites/
│   │   │   └── page.tsx              # Favorites
│   │   └── auth/
│   │       ├── callback/route.ts     # OAuth callback
│   │       └── signout/route.ts      # Sign out handler
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx            # Responsive navbar
│   │   ├── movie/
│   │   │   ├── HeroBanner.tsx        # Auto-rotating hero
│   │   │   ├── MovieCard.tsx         # Card with hover effects
│   │   │   ├── MovieRow.tsx          # Horizontal scroll row
│   │   │   ├── CastRow.tsx           # Cast members
│   │   │   ├── TrailerSection.tsx    # YouTube trailer embed
│   │   │   └── ActionButtons.tsx     # Watchlist/favorites
│   │   ├── player/
│   │   │   ├── VideoPlayer.tsx       # Vidking iframe player
│   │   │   ├── EpisodeSelector.tsx   # TV episode navigator
│   │   │   └── WatchPageClient.tsx   # TV watch page client
│   │   ├── skeletons/
│   │   │   └── index.tsx             # Loading skeleton components
│   │   └── ui/
│   │       └── toaster.tsx           # Toast notifications
│   ├── lib/
│   │   ├── tmdb/index.ts             # TMDB API client + Vidking URLs
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   └── middleware.ts         # Auth session middleware
│   │   ├── store.ts                  # Zustand global store
│   │   └── utils/index.ts            # Utility functions
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   ├── styles/
│   │   └── globals.css               # Global CSS + Tailwind
│   └── middleware.ts                 # Next.js route protection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Database schema + RLS
├── .env.example                      # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚙️ Setup Guide

### Step 1 — Clone & Install

```bash
git clone <your-repo-url> cinemax
cd cinemax
npm install
```

### Step 2 — Get TMDB API Key

1. Go to [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Create a free account and request an API key
3. Copy the **API Key (v3 auth)** value

### Step 3 — Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon public key** from Settings → API
3. Go to the **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
4. Go to **Authentication → Providers → Google** and enable it
   - You'll need a Google Cloud OAuth 2.0 Client ID and Secret
   - Authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

### Step 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Vercel Deployment

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — GitHub Integration (Recommended)

1. Push your repo to GitHub
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add all environment variables in Vercel's dashboard:
   - `NEXT_PUBLIC_TMDB_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` → set to your Vercel domain (e.g. `https://cinemax.vercel.app`)
5. Click **Deploy**

### After Deployment

Update your Supabase Google OAuth redirect URIs to include your production URL:
```
https://your-project-id.supabase.co/auth/v1/callback
```

And update your Google Cloud Console OAuth 2.0 authorized redirect URIs.

---

## 🎥 Vidking Player Integration

The player uses Vidking's free embed API:

| Media | URL Pattern |
|-------|------------|
| Movie | `https://www.vidking.net/embed/movie/{tmdbId}` |
| TV Episode | `https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}` |

**Query Parameters:**
- `color=E50914` — Accent color (matches Cinemax red)
- `autoPlay=true` — Auto-start playback
- `nextEpisode=true` — Show next episode button (TV only)
- `episodeSelector=true` — Show episode menu (TV only)
- `t=120` — Start at specific timestamp (seconds)

**Progress Tracking:**
The player emits `postMessage` events. The `VideoPlayer` component listens and saves progress to Zustand store (persisted to localStorage).

---

## 🗃️ Database Schema

### Tables

**`users`** — Extended user profiles (auto-created on signup via trigger)
- `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`

**`watch_history`** — Per-user watch progress
- `media_id`, `media_type`, `progress`, `duration`, `season_number`, `episode_number`, `last_watched_at`

**`watchlist`** — Saved-to-watch items
- `media_id`, `media_type`, `media_title`, `media_poster`, `vote_average`, `added_at`

**`favorites`** — Favorited items
- Same structure as watchlist

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 🔑 Key Features

- **SSR + ISR** — Homepage and detail pages server-rendered, revalidated hourly
- **Skeleton Loaders** — Every async section has a skeleton fallback
- **Infinite Scroll** — Search results load more as you scroll
- **Continue Watching** — Player emits progress events, stored locally
- **Watchlist & Favorites** — Persisted in localStorage via Zustand
- **Responsive** — Mobile-first, works on all screen sizes
- **Route Protection** — `/profile`, `/watchlist`, `/favorites` require auth
- **SEO** — Dynamic metadata for all pages

---

## 🎨 Design Tokens

| Token | Value |
|-------|-------|
| Background | `#0B0B0B` |
| Surface | `#141414` |
| Surface 2 | `#1A1A1A` |
| Red Accent | `#E50914` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#AAAAAA` |
| Border | `rgba(255,255,255,0.08)` |

---

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

---

## ⚠️ Legal Notice

Cinemax is a demonstration project. Content is streamed via Vidking's third-party embed system. Ensure compliance with TMDB's [Terms of Use](https://www.themoviedb.org/terms-of-use) and Vidking's terms before public deployment. This project is not affiliated with Netflix, TMDB, or Vidking.
