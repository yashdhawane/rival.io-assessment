'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import TaskCard from './task-card'
import TaskFilters from './task-filters'
import TaskPagination from './task-pagination'
import Button from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'

export default function TaskList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', page, debouncedSearch, status, sortBy, sortOrder],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 6,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (status) params.status = status
      if (sortBy) params.sortBy = sortBy
      if (sortOrder) params.sortOrder = sortOrder

      const response = await taskApi.getAll(params)
      return response.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: taskApi.delete,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks', page, debouncedSearch, status, sortBy, sortOrder])
      queryClient.setQueryData(['tasks', page, debouncedSearch, status, sortBy, sortOrder], (old: any) => ({
        ...old,
        tasks: old?.tasks?.filter((task: any) => task.id !== id) || [],
        pagination: {
          ...old?.pagination,
          total: (old?.pagination?.total || 0) - 1,
        },
      }))
      return { previousTasks }
    },
    onError: (error: any, id: string, context: any) => {
      queryClient.setQueryData(['tasks', page, debouncedSearch, status, sortBy, sortOrder], context.previousTasks)
      if (error.response?.status !== 404) {
        alert('Failed to delete task. Please try again.')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const tasks = data?.tasks || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Tasks</h2>
        <Button onClick={() => router.push('/tasks/create')}>
          Create Task
        </Button>
      </div>

      <TaskFilters
        search={search}
        status={status}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-center py-8 text-red-500">Error loading tasks</p>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks found</p>
          <Button onClick={() => router.push('/tasks/create')}>
            Create Your First Task
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task: any) => (
              <TaskCard key={task.id} task={task} onDelete={handleDelete} />
            ))}
          </div>

          <TaskPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
