import { prisma } from '../config/database'

export class AttachmentRepository {
  async findByTaskId(taskId: string) {
    console.log('[AttachmentRepository] findByTaskId - taskId:', taskId)
    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    })
    console.log('[AttachmentRepository] findByTaskId - attachments:', attachments)
    return attachments
  }

  async findById(id: string) {
    console.log('[AttachmentRepository] findById - id:', id)
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    })
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

  async delete(id: string) {
    console.log('[AttachmentRepository] delete - id:', id)
    const attachment = await prisma.attachment.delete({
      where: { id },
    })
    console.log('[AttachmentRepository] delete - attachment deleted')
    return attachment
  }

  async deleteByTaskId(taskId: string) {
    console.log('[AttachmentRepository] deleteByTaskId - taskId:', taskId)
    const result = await prisma.attachment.deleteMany({
      where: { taskId },
    })
    console.log('[AttachmentRepository] deleteByTaskId - attachments deleted:', result)
    return result
  }
}

export const attachmentRepository = new AttachmentRepository()
