import { prisma } from '../config/database'

export class TaskRepository {
  async findByUserId(userId: string, page: number = 1, limit: number = 10) {
    console.log('[TaskRepository] findByUserId - userId:', userId, 'page:', page, 'limit:', limit)
    const skip = (page - 1) * limit
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.task.count({ where: { userId } }),
    ])
    
    console.log('[TaskRepository] findByUserId - tasks found:', tasks.length, 'total:', total)
    console.log('[TaskRepository] findByUserId - task userIds:', tasks.map(t => t.userId))

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId },
      include: {
        attachments: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async create(data: any, userId: string) {
    console.log('[TaskRepository] create - data:', data)
    console.log('[TaskRepository] create - userId:', userId)
    
    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
      },
      include: {
        attachments: true,
        activities: true,
      },
    })
    
    console.log('[TaskRepository] create - task created:', task)
    return task
  }

  async update(id: string, userId: string, data: any) {
    // First check if task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    })
    
    if (!existingTask) {
      throw new Error('Task not found or access denied')
    }
    
    return prisma.task.update({
      where: { id },
      data,
      include: {
        attachments: true,
        activities: true,
      },
    })
  }

  async delete(id: string, userId: string) {
    console.log('[TaskRepository] delete - id:', id, 'userId:', userId)
    // First check if task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    })
    
    if (!existingTask) {
      throw new Error('Task not found or access denied')
    }
    
    const task = await prisma.task.delete({
      where: { id },
    })
    console.log('[TaskRepository] delete - task deleted')
    return task
  }

  async searchByTitle(userId: string, search: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ])

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findByStatus(userId: string, status: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: { userId, status },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.task.count({ where: { userId, status } }),
    ])

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findSorted(userId: string, sortBy: string, sortOrder: 'asc' | 'desc', page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy,
        include: {
          attachments: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.task.count({ where: { userId } }),
    ])

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}

export const taskRepository = new TaskRepository()
