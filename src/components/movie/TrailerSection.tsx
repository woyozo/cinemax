'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TrailerSectionProps {
  trailerKey: string
  title: string
}

export function TrailerSection({ trailerKey, title }: TrailerSectionProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Trailer</h2>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-cinemax-dark-3 max-w-2xl">
        <AnimatePresence>
          {!playing && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group"
              onClick={() => setPlaying(true)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://img.youtube.com/vi/${trailerKey}/maxresdefault.jpg)`,
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative w-16 h-16 rounded-full bg-cinemax-red/90 flex items-center justify-center group-hover:bg-cinemax-red group-hover:scale-110 transition-all duration-200 shadow-xl">
                <Play className="w-7 h-7 fill-white text-white ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {playing && (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={`${title} Trailer`}
          />
        )}
      </div>
    </section>
  )
}
