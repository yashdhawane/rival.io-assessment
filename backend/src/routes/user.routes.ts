import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.patch('/preferences', authMiddleware, userController.updatePreferences.bind(userController))

export default router
