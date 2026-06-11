'use client'

import { activityApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

interface ActivityLogProps {
  taskId: string
}

export default function ActivityLog({ taskId }: ActivityLogProps) {
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['activities', taskId],
    queryFn: async () => {
      const response = await activityApi.getByTaskId(taskId)
      return response.data.data.activities
    },
  })

  if (isLoading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading activities...</p>
  }

  if (error) {
    return <p className="text-red-500">Error loading activities</p>
  }

  if (activities.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Activity Log</h3>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500"
          >
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
