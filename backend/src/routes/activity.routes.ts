import { Router } from 'express'
import { activityController } from '../controllers/activity.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/tasks/:taskId/activities', authMiddleware, activityController.getActivities.bind(activityController))

export default router
