import { Request, Response } from 'express'
import { activityRepository } from '../repositories/activity.repository'
import { AuthRequest } from '../middleware/auth.middleware'

export class ActivityController {
  async getActivities(req: AuthRequest, res: Response) {
    console.log('[ActivityController] getActivities - request received')
    console.log('[ActivityController] getActivities - params:', req.params)
    console.log('[ActivityController] getActivities - query:', req.query)
    try {
      const userId = req.user?.userId
      console.log('[ActivityController] getActivities - userId:', userId)
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const { taskId } = req.params
      const taskIdString = Array.isArray(taskId) ? taskId[0] : taskId
      console.log('[ActivityController] getActivities - taskId:', taskIdString)

      const limit = parseInt(req.query.limit as string) || 20
      console.log('[ActivityController] getActivities - limit:', limit)
      const activities = await activityRepository.findByTaskId(taskIdString, limit)
      console.log('[ActivityController] getActivities - activities retrieved:', activities)

      res.status(200).json({
        success: true,
        data: { activities },
      })
    } catch (error: any) {
      console.error('[ActivityController] getActivities - error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get activities',
          code: 'GET_ACTIVITIES_ERROR',
        },
      })
    }
  }
}

export const activityController = new ActivityController()
