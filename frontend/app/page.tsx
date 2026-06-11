'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function Home() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  )
}
