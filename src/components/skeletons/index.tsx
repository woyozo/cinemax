import { cn } from '@/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex-shrink-0', className)} style={{ width: 'clamp(120px, 15vw, 180px)' }}>
      <div className="aspect-poster rounded-lg skeleton" />
    </div>
  )
}

export function SkeletonRow({ count = 8 }: { count?: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-48 skeleton rounded" />
        <div className="h-4 w-16 skeleton rounded" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4 sm:px-6 lg:px-8">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] skeleton" />
  )
}

export function SkeletonDetails() {
  return (
    <div className="min-h-screen bg-cinemax-dark">
      {/* Backdrop skeleton */}
      <div className="h-[50vh] skeleton" />
      
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex gap-8">
          {/* Poster */}
          <div className="hidden sm:block w-48 lg:w-64 flex-shrink-0">
            <div className="aspect-poster skeleton rounded-xl" />
          </div>
          
          {/* Info */}
          <div className="flex-1 pt-8 space-y-4">
            <div className="h-10 w-3/4 skeleton rounded" />
            <div className="h-5 w-1/3 skeleton rounded" />
            <div className="flex gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-6 w-20 skeleton rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-3/4 skeleton rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonSearchCard() {
  return (
    <div className="flex gap-4 p-3 rounded-xl">
      <div className="w-16 h-24 skeleton rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-5/6 skeleton rounded" />
      </div>
    </div>
  )
}
