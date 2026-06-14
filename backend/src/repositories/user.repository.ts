import { prisma } from '../config/database'
import { User } from '@prisma/client'

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    console.log('[UserRepository] findByEmail - email:', email)
    const user = await prisma.user.findUnique({
      where: { email },
    })
    console.log('[UserRepository] findByEmail - user found:', user ? 'yes' : 'no')
    return user
  }

  async findById(id: string): Promise<User | null> {
    console.log('[UserRepository] findById - id:', id)
    const user = await prisma.user.findUnique({
      where: { id },
    })
    console.log('[UserRepository] findById - user found:', user ? 'yes' : 'no')
    return user
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    console.log('[UserRepository] create - data:', data)
    const user = await prisma.user.create({
      data,
    })
    console.log('[UserRepository] create - user created:', user)
    return user
  }

  async updateThemePreference(userId: string, themePreference: string): Promise<User> {
    console.log('[UserRepository] updateThemePreference - userId:', userId, 'themePreference:', themePreference)
    const user = await prisma.user.update({
      where: { id: userId },
      data: { themePreference },
    })
    console.log('[UserRepository] updateThemePreference - user updated:', user)
    return user
  }
}

export const userRepository = new UserRepository()
