import { Response } from 'express'
import { authService } from '../services/auth.service'
import { AuthRequest } from '../middleware/auth.middleware'

export class UserController {
  async updatePreferences(req: AuthRequest, res: Response) {
    console.log('[UserController] updatePreferences - request body:', req.body)
    try {
      const userId = req.user?.userId
      console.log('[UserController] updatePreferences - userId:', userId)
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const { themePreference } = req.body
      console.log('[UserController] updatePreferences - themePreference:', themePreference)
      const user = await authService.updateThemePreference(userId, themePreference)
      console.log('[UserController] updatePreferences - user updated:', user)

      res.status(200).json({
        success: true,
        data: { themePreference: user.themePreference },
      })
    } catch (error: any) {
      console.error('[UserController] updatePreferences - error:', error)
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to update preferences',
          code: 'UPDATE_PREFERENCES_ERROR',
        },
      })
    }
  }
}

export const userController = new UserController()
