import Image from 'next/image'
import { CastMember } from '@/types'
import { tmdbImageUrl } from '@/lib/tmdb'

interface CastRowProps {
  cast: CastMember[]
}

export function CastRow({ cast }: CastRowProps) {
  const topCast = cast.slice(0, 12)

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {topCast.map((member) => (
          <div
            key={member.id}
            className="flex-shrink-0 w-24 text-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-cinemax-dark-3 mx-auto mb-2 border-2 border-white/10">
              {member.profile_path ? (
                <Image
                  src={tmdbImageUrl(member.profile_path, 'w185')}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                  {member.name[0]}
                </div>
              )}
            </div>
            <p className="text-white text-xs font-medium truncate">{member.name}</p>
            <p className="text-gray-500 text-xs truncate">{member.character}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
