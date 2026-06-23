import { Suspense } from 'react'
import { LoginClient } from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cinemax-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cinemax-red border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginClient />
    </Suspense>
  )
}
