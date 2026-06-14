import { Router } from 'express'
import { taskController } from '../controllers/task.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authMiddleware, taskController.createTask.bind(taskController))
router.get('/', authMiddleware, taskController.getTasks.bind(taskController))
router.get('/:id', authMiddleware, taskController.getTaskById.bind(taskController))
router.patch('/:id', authMiddleware, taskController.updateTask.bind(taskController))
router.delete('/:id', authMiddleware, taskController.deleteTask.bind(taskController))

export default router
