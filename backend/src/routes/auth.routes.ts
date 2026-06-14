import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/signup', authController.signup.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.get('/me', authMiddleware, authController.me.bind(authController))
router.patch('/preferences', authMiddleware, authController.updatePreferences.bind(authController))

export default router
