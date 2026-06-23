import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Bookmark, Heart, Clock, LogOut, User } from 'lucide-react'

export const metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const email = user.email || ''

  return (
    <div className="min-h-screen bg-cinemax-dark pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Avatar + Name */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-cinemax-red flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 border-4 border-white/10">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              fullName[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
            <p className="text-gray-400 text-sm">{email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-cinemax-red/20 text-cinemax-red text-xs rounded-full font-medium border border-cinemax-red/30">
              Member
            </span>
          </div>
        </div>

        {/* Quick Stats / Nav */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          <Link
            href="/watchlist"
            className="flex items-center gap-4 p-5 bg-cinemax-dark-2 border border-white/8 rounded-xl hover:border-white/20 hover:bg-cinemax-dark-3 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold group-hover:text-gray-200">Watchlist</p>
              <p className="text-gray-500 text-sm">Movies & shows saved to watch</p>
            </div>
          </Link>

          <Link
            href="/favorites"
            className="flex items-center gap-4 p-5 bg-cinemax-dark-2 border border-white/8 rounded-xl hover:border-white/20 hover:bg-cinemax-dark-3 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold group-hover:text-gray-200">Favorites</p>
              <p className="text-gray-500 text-sm">Your favorite titles</p>
            </div>
          </Link>
        </div>

        {/* Account Info */}
        <div className="p-5 bg-cinemax-dark-2 border border-white/8 rounded-xl mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Name</span>
              <span className="text-white text-sm">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Email</span>
              <span className="text-white text-sm truncate max-w-[60%]">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Provider</span>
              <span className="text-white text-sm capitalize">
                {user.app_metadata?.provider || 'Email'}
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
