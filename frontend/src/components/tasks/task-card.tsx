'use client'

import { useState } from 'react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface TaskCardProps {
  task: any
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    high: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(task.id)
    }, 300)
  }

  if (isDeleting) {
    return (
      <Card className="p-4 scale-95 opacity-50 transition-all duration-300">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.dueDate && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => router.push(`/tasks/${task.id}`)}
          className="flex-1"
        >
          View Details
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          className="flex-1"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Card>
  )
}
