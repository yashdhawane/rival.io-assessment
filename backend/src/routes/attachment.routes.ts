import { Router } from 'express'
import { attachmentController } from '../controllers/attachment.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { uploadSingle } from '../middleware/upload.middleware'

const router = Router()

// Cloudinary signed upload endpoints
router.post('/tasks/:taskId/attachments/signature', authMiddleware, attachmentController.getUploadSignature.bind(attachmentController))
router.post('/tasks/:taskId/attachments/metadata', authMiddleware, attachmentController.saveAttachmentMetadata.bind(attachmentController))

// Legacy multer upload endpoint
router.post('/tasks/:taskId/attachments', authMiddleware, uploadSingle, attachmentController.uploadAttachment.bind(attachmentController))
router.get('/tasks/:taskId/attachments', authMiddleware, attachmentController.getAttachments.bind(attachmentController))
router.delete('/tasks/:taskId/attachments/:attachmentId', authMiddleware, attachmentController.deleteAttachment.bind(attachmentController))

export default router
