import { cloudinary } from '../config/storage'
import { attachmentRepository } from '../repositories/attachment.repository'
import { activityRepository } from '../repositories/activity.repository'

export class AttachmentService {
  async createAttachment(data: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    taskId: string
    userId: string
  }) {
    console.log('[AttachmentService] createAttachment - data:', data)
    const attachment = await attachmentRepository.create({
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      taskId: data.taskId,
    })
    console.log('[AttachmentService] createAttachment - attachment created:', attachment)
    return attachment
  }

  async uploadAttachment(
    file: Express.Multer.File,
    taskId: string,
    userId: string
  ) {
    console.log('[AttachmentService] uploadAttachment - file:', file.originalname, 'taskId:', taskId, 'userId:', userId)
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'task-attachments',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(file.buffer)
    }) as any
    console.log('[AttachmentService] uploadAttachment - cloudinary result:', result)

    // Save to database
    const attachment = await attachmentRepository.create({
      filename: result.public_id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: result.secure_url,
      taskId,
    })
    console.log('[AttachmentService] uploadAttachment - attachment created:', attachment)

    // Log activity
    await activityRepository.create({
      action: 'attachment_added',
      description: `Attachment added: ${file.originalname}`,
      taskId,
      userId,
    })

    return attachment
  }

  async getAttachmentsByTaskId(taskId: string) {
    console.log('[AttachmentService] getAttachmentsByTaskId - taskId:', taskId)
    const attachments = await attachmentRepository.findByTaskId(taskId)
    console.log('[AttachmentService] getAttachmentsByTaskId - attachments:', attachments)
    return attachments
  }

  async deleteAttachment(id: string, taskId: string, userId: string) {
    console.log('[AttachmentService] deleteAttachment - id:', id, 'taskId:', taskId, 'userId:', userId)
    const attachment = await attachmentRepository.findById(id)
    console.log('[AttachmentService] deleteAttachment - attachment found:', attachment ? 'yes' : 'no')
    if (!attachment) {
      throw new Error('Attachment not found')
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(attachment.filename)
    console.log('[AttachmentService] deleteAttachment - deleted from cloudinary')

    // Delete from database
    await attachmentRepository.delete(id)
    console.log('[AttachmentService] deleteAttachment - deleted from database')

    // Log activity
    await activityRepository.create({
      action: 'attachment_removed',
      description: `Attachment removed: ${attachment.originalName}`,
      taskId,
      userId,
    })
  }
}

export const attachmentService = new AttachmentService()
