import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cinemax-dark flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-8xl font-black text-cinemax-red mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-cinemax-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
