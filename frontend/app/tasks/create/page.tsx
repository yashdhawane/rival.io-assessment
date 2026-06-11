'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { useQueryClient } from '@tanstack/react-query'
import ThemeToggle from '@/components/ui/theme-toggle'
import Button from '@/components/ui/button'
import TaskForm from '@/components/tasks/task-form'
import { useEffect } from 'react'

export default function CreateTaskPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()
  const queryClient = useQueryClient()

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

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    router.push('/dashboard')
  }

  if (!user) {
    return <p className="text-center py-8">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Manager
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Task</h2>
          <TaskForm onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  )
}
