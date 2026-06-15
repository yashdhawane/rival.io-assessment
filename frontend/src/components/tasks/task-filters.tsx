'use client'

import Input from '@/components/ui/input'
import Select from '@/components/ui/select'

interface TaskFiltersProps {
  search: string
  status: string
  sortBy: string
  sortOrder: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSortChange: (value: string) => void
  onSortOrderChange: (value: string) => void
}

export default function TaskFilters({
  search,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onSortOrderChange,
}: TaskFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        />

        <Select
          label="Status"
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        <Select
          label="Sort By"
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value)}
          options={[
            { value: '', label: 'Default' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'priority', label: 'Priority' },
            { value: 'createdAt', label: 'Created Date' },
          ]}
        />

        <Select
          label="Sort Order"
          value={sortOrder}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortOrderChange(e.target.value)}
          options={[
            { value: 'desc', label: 'Descending' },
            { value: 'asc', label: 'Ascending' },
          ]}
        />
      </div>
    </div>
  )
}
