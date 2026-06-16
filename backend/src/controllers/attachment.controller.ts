import { Request, Response } from 'express'
import { attachmentService } from '../services/attachment.service'
import { activityRepository } from '../repositories/activity.repository'
import { AuthRequest } from '../middleware/auth.middleware'
import cloudinaryService from '../services/cloudinary.service'

export class AttachmentController {
  async getUploadSignature(req: AuthRequest, res: Response) {
    console.log('[AttachmentController] getUploadSignature - request received')
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

      const { taskId } = req.params
      const taskIdString = Array.isArray(taskId) ? taskId[0] : taskId
      const { filename, mimeType, size } = req.body

      // Verify task ownership
      const { taskRepository } = await import('../repositories/task.repository')
      const task = await taskRepository.findById(taskIdString, userId)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found or access denied',
            code: 'TASK_NOT_FOUND',
          },
        })
      }

      // Validate file
      const file = new File([], filename, { type: mimeType })
      Object.defineProperty(file, 'size', { value: size })
      
      const validation = cloudinaryService.validateFile(file)
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            message: validation.error,
            code: 'INVALID_FILE',
          },
        })
      }

      // Generate signature
      const timestamp = Math.round(Date.now() / 1000)
      const publicId = `${taskIdString}_${Date.now()}`
      
      const signature = cloudinaryService.generateUploadSignature({
        timestamp,
        publicId,
        folder: 'task_attachments',
      })

      res.status(200).json({
        success: true,
        data: signature,
      })
    } catch (error: any) {
      console.error('[AttachmentController] getUploadSignature - error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to generate upload signature',
          code: 'SIGNATURE_ERROR',
        },
      })
    }
  }

  async saveAttachmentMetadata(req: AuthRequest, res: Response) {
    console.log('[AttachmentController] saveAttachmentMetadata - request received')
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

      const { taskId } = req.params
      const taskIdString = Array.isArray(taskId) ? taskId[0] : taskId
      const { filename, originalName, mimeType, size, url, publicId } = req.body

      // Verify task ownership
      const { taskRepository } = await import('../repositories/task.repository')
      const task = await taskRepository.findById(taskIdString, userId)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found or access denied',
            code: 'TASK_NOT_FOUND',
          },
        })
      }

      const attachment = await attachmentService.createAttachment({
        filename,
        originalName,
        mimeType,
        size,
        url,
        taskId: taskIdString,
        userId,
      })

      // Log activity
      await activityRepository.create({
        action: 'attachment_added',
        description: `Attachment "${originalName}" was added`,
        metadata: { filename, publicId },
        taskId: taskIdString,
        userId,
      })

      res.status(201).json({
        success: true,
        data: attachment,
      })
    } catch (error: any) {
      console.error('[AttachmentController] saveAttachmentMetadata - error:', error)
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to save attachment metadata',
          code: 'SAVE_METADATA_ERROR',
        },
      })
    }
  }

  async uploadAttachment(req: AuthRequest, res: Response) {
    console.log('[AttachmentController] uploadAttachment - request received')
    console.log('[AttachmentController] uploadAttachment - params:', req.params)
    console.log('[AttachmentController] uploadAttachment - file:', req.file)
    try {
      const userId = req.user?.userId
      console.log('[AttachmentController] uploadAttachment - userId:', userId)
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
      console.log('[AttachmentController] uploadAttachment - taskId:', taskIdString)

      // Verify task ownership
      const { taskRepository } = await import('../repositories/task.repository')
      const task = await taskRepository.findById(taskIdString, userId)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found or access denied',
            code: 'TASK_NOT_FOUND',
          },
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No file uploaded',
            code: 'NO_FILE',
          },
        })
      }

      const attachment = await attachmentService.uploadAttachment(req.file, taskIdString, userId)
      console.log('[AttachmentController] uploadAttachment - attachment created:', attachment)

      res.status(201).json({
        success: true,
        data: attachment,
      })
    } catch (error: any) {
      console.error('[AttachmentController] uploadAttachment - error:', error)
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to upload attachment',
          code: 'UPLOAD_ERROR',
        },
      })
    }
  }

  async getAttachments(req: AuthRequest, res: Response) {
    console.log('[AttachmentController] getAttachments - request received')
    console.log('[AttachmentController] getAttachments - params:', req.params)
    try {
      const userId = req.user?.userId
      console.log('[AttachmentController] getAttachments - userId:', userId)
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
      console.log('[AttachmentController] getAttachments - taskId:', taskIdString)

      const attachments = await attachmentService.getAttachmentsByTaskId(taskIdString, userId)
      console.log('[AttachmentController] getAttachments - attachments retrieved:', attachments)

      res.status(200).json({
        success: true,
        data: { attachments },
      })
    } catch (error: any) {
      console.error('[AttachmentController] getAttachments - error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get attachments',
          code: 'GET_ATTACHMENTS_ERROR',
        },
      })
    }
  }

  async deleteAttachment(req: AuthRequest, res: Response) {
    console.log('[AttachmentController] deleteAttachment - request received')
    console.log('[AttachmentController] deleteAttachment - params:', req.params)
    try {
      const userId = req.user?.userId
      console.log('[AttachmentController] deleteAttachment - userId:', userId)
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const { taskId, attachmentId } = req.params
      const taskIdString = Array.isArray(taskId) ? taskId[0] : taskId
      const attachmentIdString = Array.isArray(attachmentId) ? attachmentId[0] : attachmentId
      console.log('[AttachmentController] deleteAttachment - taskId:', taskIdString, 'attachmentId:', attachmentIdString)

      await attachmentService.deleteAttachment(attachmentIdString, taskIdString, userId)
      console.log('[AttachmentController] deleteAttachment - attachment deleted')

      res.status(200).json({
        success: true,
        message: 'Attachment deleted successfully',
      })
    } catch (error: any) {
      console.error('[AttachmentController] deleteAttachment - error:', error)
      res.status(404).json({
        success: false,
        error: {
          message: error.message || 'Attachment not found',
          code: 'ATTACHMENT_NOT_FOUND',
        },
      })
    }
  }
}

export const attachmentController = new AttachmentController()
