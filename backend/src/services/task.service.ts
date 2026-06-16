import { taskRepository } from '../repositories/task.repository'
import { activityRepository } from '../repositories/activity.repository'
import { CreateTaskInput, UpdateTaskInput } from '../utils/validations'

export class TaskService {
  async createTask(data: CreateTaskInput, userId: string) {
    console.log('[TaskService] createTask - data:', data)
    console.log('[TaskService] createTask - userId:', userId)
    
    const task = await taskRepository.create(data, userId)
    console.log('[TaskService] createTask - task created in repository:', task)
    
    // Log activity
    await activityRepository.create({
      action: 'created',
      description: 'Task created',
      taskId: task.id,
      userId,
    })

    return task
  }

  async getTasks(userId: string, page: number = 1, limit: number = 10) {
    return taskRepository.findByUserId(userId, page, limit)
  }

  async getTaskById(id: string, userId: string) {
    const task = await taskRepository.findById(id, userId)
    if (!task) {
      throw new Error('Task not found')
    }
    return task
  }

  async updateTask(id: string, userId: string, data: UpdateTaskInput) {
    const existingTask = await taskRepository.findById(id, userId)
    if (!existingTask) {
      throw new Error('Task not found')
    }

    // Track changes for activity log
    const changes: any = {}
    if (data.title && data.title !== existingTask.title) {
      changes.title = { old: existingTask.title, new: data.title }
    }
    if (data.status && data.status !== existingTask.status) {
      changes.status = { old: existingTask.status, new: data.status }
    }
    if (data.priority && data.priority !== existingTask.priority) {
      changes.priority = { old: existingTask.priority, new: data.priority }
    }
    if (data.dueDate !== undefined && data.dueDate !== existingTask.dueDate?.toISOString()) {
      changes.dueDate = { old: existingTask.dueDate, new: data.dueDate }
    }

    const task = await taskRepository.update(id, userId, data)

    // Log activity if there were changes
    if (Object.keys(changes).length > 0) {
      if (changes.status) {
        await activityRepository.create({
          action: 'status_changed',
          description: `Status changed from ${changes.status.old} to ${changes.status.new}`,
          taskId: task.id,
          userId,
          metadata: changes,
        })
      } else {
        await activityRepository.create({
          action: 'updated',
          description: 'Task updated',
          taskId: task.id,
          userId,
          metadata: changes,
        })
      }
    }

    return task
  }

  async deleteTask(id: string, userId: string) {
    console.log('[TaskService] deleteTask - id:', id, 'userId:', userId)
    const existingTask = await taskRepository.findById(id, userId)
    console.log('[TaskService] deleteTask - existing task:', existingTask ? 'yes' : 'no')
    if (!existingTask) {
      throw new Error('Task not found')
    }

    await taskRepository.delete(id, userId)
    console.log('[TaskService] deleteTask - task deleted from repository')

    // Log activity (non-blocking)
    try {
      await activityRepository.create({
        action: 'deleted',
        description: 'Task deleted',
        taskId: id,
        userId,
      })
      console.log('[TaskService] deleteTask - activity logged')
    } catch (error) {
      console.error('[TaskService] deleteTask - failed to log activity:', error)
      // Don't throw error - task deletion is successful
    }
  }

  async searchTasks(userId: string, search: string, page: number = 1, limit: number = 10) {
    return taskRepository.searchByTitle(userId, search, page, limit)
  }

  async filterTasksByStatus(userId: string, status: string, page: number = 1, limit: number = 10) {
    return taskRepository.findByStatus(userId, status, page, limit)
  }

  async sortTasks(userId: string, sortBy: string, sortOrder: 'asc' | 'desc', page: number = 1, limit: number = 10) {
    return taskRepository.findSorted(userId, sortBy, sortOrder, page, limit)
  }
}

export const taskService = new TaskService()
