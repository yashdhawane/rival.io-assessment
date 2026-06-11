'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import { taskApi } from '@/lib/api'

interface TaskFormProps {
  task?: any
  onSuccess?: () => void
}

export default function TaskForm({ task, onSuccess }: TaskFormProps) {
  const queryClient = useQueryClient()
  
  // Convert ISO date to datetime-local format for input
  const formatDueDateForInput = (isoDate: string | null | undefined) => {
    if (!isoDate) return ''
    const date = new Date(isoDate)
    // Format: YYYY-MM-DDTHH:mm (local time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: task ? {
      ...task,
      dueDate: formatDueDateForInput(task.dueDate),
    } : {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: taskApi.create,
    onError: (error: any) => {
      console.error('Error creating task:', error.response?.data?.error?.message || 'Failed to create task')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskApi.update(id, data),
    onMutate: async ({ id, data }: { id: string; data: any }) => {
      await queryClient.cancelQueries({ queryKey: ['task', id] })
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTask = queryClient.getQueryData(['task', id])
      const previousTasks = queryClient.getQueryData(['tasks'])
      queryClient.setQueryData(['task', id], (old: any) => ({ ...old, ...data }))
      queryClient.setQueryData(['tasks'], (old: any) => ({
        ...old,
        tasks: old?.tasks?.map((t: any) => t.id === id ? { ...t, ...data } : t) || [],
      }))
      return { previousTask, previousTasks }
    },
    onError: (error: any, variables: any, context: any) => {
      queryClient.setQueryData(['task', variables.id], context.previousTask)
      queryClient.setQueryData(['tasks'], context.previousTasks)
      console.error('Error updating task:', error.response?.data?.error?.message || 'Failed to update task')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', task?.id] })
    },
  })

  const onSubmit = async (data: any) => {
    try {
      // Convert empty string dueDate to null
      let dueDate = null
      if (data.dueDate) {
        // Convert datetime-local format to ISO-8601 format
        const date = new Date(data.dueDate)
        dueDate = date.toISOString()
      }
      
      const submitData = {
        ...data,
        dueDate,
      }
      
      if (task) {
        await updateMutation.mutateAsync({ id: task.id, data: submitData })
      } else {
        await createMutation.mutateAsync(submitData)
      }
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving task:', error.response?.data?.error?.message || 'Failed to save task')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        {...register('title', { required: 'Title is required' })}
        error={errors.title?.message as string}
        placeholder="Task title"
      />

      <Textarea
        label="Description"
        {...register('description')}
        placeholder="Task description"
        rows={4}
      />

      <Select
        label="Status"
        {...register('status')}
        options={[
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
        ]}
      />

      <Select
        label="Priority"
        {...register('priority')}
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]}
      />

      <Input
        label="Due Date"
        type="datetime-local"
        {...register('dueDate')}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
      </Button>
    </form>
  )
}
