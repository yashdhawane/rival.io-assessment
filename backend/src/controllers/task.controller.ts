import { Request, Response } from 'express'
import { taskService } from '../services/task.service'
import { createTaskSchema, updateTaskSchema } from '../utils/validations'
import { AuthRequest } from '../middleware/auth.middleware'

export class TaskController {
  async createTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      console.log('[TaskController] createTask - userId:', userId)
      console.log('[TaskController] createTask - request body:', req.body)
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const validatedData = createTaskSchema.parse(req.body)
      console.log('[TaskController] createTask - validated data:', validatedData)
      
      const task = await taskService.createTask(validatedData, userId)
      console.log('[TaskController] createTask - task created:', task)

      res.status(201).json({
        success: true,
        data: task,
      })
    } catch (error: any) {
      console.error('[TaskController] createTask - error:', error)
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to create task',
          code: 'CREATE_TASK_ERROR',
        },
      })
    }
  }

  async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      console.log('[TaskController] getTasks - userId:', userId)
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = req.query.search as string
      const status = req.query.status as string
      const sortBy = req.query.sortBy as string
      const sortOrder = (req.query.sortOrder as string) || 'desc'

      let result

      if (search) {
        result = await taskService.searchTasks(userId, search, page, limit)
      } else if (status) {
        result = await taskService.filterTasksByStatus(userId, status, page, limit)
      } else if (sortBy) {
        result = await taskService.sortTasks(userId, sortBy, sortOrder as 'asc' | 'desc', page, limit)
      } else {
        result = await taskService.getTasks(userId, page, limit)
      }

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get tasks',
          code: 'GET_TASKS_ERROR',
        },
      })
    }
  }

  async getTaskById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const { id } = req.params
      const taskId = Array.isArray(id) ? id[0] : id
      const task = await taskService.getTaskById(taskId, userId)

      res.status(200).json({
        success: true,
        data: task,
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message || 'Task not found',
          code: 'TASK_NOT_FOUND',
        },
      })
    }
  }

  async updateTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const { id } = req.params
      const taskId = Array.isArray(id) ? id[0] : id
      const validatedData = updateTaskSchema.parse(req.body)
      const task = await taskService.updateTask(taskId, userId, validatedData)

      res.status(200).json({
        success: true,
        data: task,
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to update task',
          code: 'UPDATE_TASK_ERROR',
        },
      })
    }
  }

  async deleteTask(req: AuthRequest, res: Response) {
    console.log('[TaskController] deleteTask - request received')
    console.log('[TaskController] deleteTask - params:', req.params)
    try {
      const userId = req.user?.userId
      console.log('[TaskController] deleteTask - userId:', userId)
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const { id } = req.params
      const taskId = Array.isArray(id) ? id[0] : id
      console.log('[TaskController] deleteTask - taskId:', taskId)
      await taskService.deleteTask(taskId, userId)
      console.log('[TaskController] deleteTask - task deleted')

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      })
    } catch (error: any) {
      console.error('[TaskController] deleteTask - error:', error)
      res.status(404).json({
        success: false,
        error: {
          message: error.message || 'Task not found',
          code: 'TASK_NOT_FOUND',
        },
      })
    }
  }
}

export const taskController = new TaskController()
