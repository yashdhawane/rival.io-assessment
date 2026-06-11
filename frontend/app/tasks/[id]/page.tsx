'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import ThemeToggle from '@/components/ui/theme-toggle'
import Button from '@/components/ui/button'
import TaskForm from '@/components/tasks/task-form'
import TaskAttachments from '@/components/tasks/task-attachments'
import ActivityLog from '@/components/tasks/activity-log'
import { taskApi, attachmentApi } from '@/lib/api'
import Card from '@/components/ui/card'

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <TaskDetailContent taskId={id} />
}

function TaskDetailContent({ taskId }: { taskId: string }) {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()
  const queryClient = useQueryClient()

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskApi.getById(taskId)
      return response.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.push('/dashboard')
    },
    onError: (error: any) => {
      console.error('Error deleting task:', error)
      if (error.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        router.push('/dashboard')
      } else {
        alert('Failed to delete task. Please try again.')
      }
    },
  })

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

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    deleteMutation.mutate(taskId)
  }

  if (!user || isLoading) {
    return <p className="text-center py-8">Loading...</p>
  }

  if (error) {
    return <p className="text-center py-8 text-red-500">Error loading task</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h2>
          <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Task'}
          </Button>
        </div>

        <Card className="p-6 animate-fade-in">
          <TaskForm task={task} onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] })
            queryClient.invalidateQueries({ queryKey: ['activities', taskId] })
          }} />
        </Card>

        <Card className="p-6 animate-fade-in">
          <TaskAttachments
            taskId={taskId}
            attachments={task?.attachments || []}
            onAttachmentsChange={() => queryClient.invalidateQueries({ queryKey: ['task', taskId] })}
          />
        </Card>

        <Card className="p-6 animate-fade-in">
          <ActivityLog taskId={taskId} />
        </Card>
      </main>
    </div>
  )
}
