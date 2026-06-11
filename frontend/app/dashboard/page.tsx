'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { authApi } from '@/lib/api'
import ThemeToggle from '@/components/ui/theme-toggle'
import Button from '@/components/ui/button'
import TaskList from '@/components/tasks/task-list'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      const response = await authApi.logout()
      
      if (response.data.success) {
        logout()
        router.push('/login')
      } else {
        console.error('Logout failed:', response.data.error)
        // Still proceed with client-side logout even if server fails
        logout()
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Proceed with client-side logout even if server fails
      logout()
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return <p className="text-center py-8">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Manager
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
            <Button variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskList />
      </main>
    </div>
  )
}
