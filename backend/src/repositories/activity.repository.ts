import { prisma } from '../config/database'

export class ActivityRepository {
  async create(data: { action: string; description: string; taskId: string; userId: string; metadata?: any }) {
    console.log('[ActivityRepository] create - data:', data)
    const activity = await prisma.activity.create({
      data,
    })
    console.log('[ActivityRepository] create - activity created:', activity)
    return activity
  }

  async findByTaskId(taskId: string, limit: number = 20) {
    console.log('[ActivityRepository] findByTaskId - taskId:', taskId, 'limit:', limit)
    const activities = await prisma.activity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    console.log('[ActivityRepository] findByTaskId - activities:', activities)
    return activities
  }
}

export const activityRepository = new ActivityRepository()
