import { prisma } from '../config/database'

export class AttachmentRepository {
  async findByTaskId(taskId: string, userId: string) {
    console.log('[AttachmentRepository] findByTaskId - taskId:', taskId, 'userId:', userId)
    // First verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    })
    
    if (!task) {
      throw new Error('Task not found or access denied')
    }
    
    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    })
    console.log('[AttachmentRepository] findByTaskId - attachments:', attachments)
    return attachments
  }

  async findById(id: string, userId: string) {
    console.log('[AttachmentRepository] findById - id:', id, 'userId:', userId)
    // Get attachment and verify task ownership
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { task: true },
    })
    
    if (!attachment || attachment.task.userId !== userId) {
      throw new Error('Attachment not found or access denied')
    }
    
    console.log('[AttachmentRepository] findById - attachment:', attachment)
    return attachment
  }

  async create(data: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    taskId: string
  }) {
    console.log('[AttachmentRepository] create - data:', data)
    const attachment = await prisma.attachment.create({
      data,
    })
    console.log('[AttachmentRepository] create - attachment created:', attachment)
    return attachment
  }

  async delete(id: string, userId: string) {
    console.log('[AttachmentRepository] delete - id:', id, 'userId:', userId)
    // Get attachment and verify task ownership
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { task: true },
    })
    
    if (!attachment || attachment.task.userId !== userId) {
      throw new Error('Attachment not found or access denied')
    }
    
    const deletedAttachment = await prisma.attachment.delete({
      where: { id },
    })
    console.log('[AttachmentRepository] delete - attachment deleted')
    return deletedAttachment
  }

  async deleteByTaskId(taskId: string, userId: string) {
    console.log('[AttachmentRepository] deleteByTaskId - taskId:', taskId, 'userId:', userId)
    // First verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    })
    
    if (!task) {
      throw new Error('Task not found or access denied')
    }
    
    const result = await prisma.attachment.deleteMany({
      where: { taskId },
    })
    console.log('[AttachmentRepository] deleteByTaskId - attachments deleted:', result)
    return result
  }
}

export const attachmentRepository = new AttachmentRepository()
