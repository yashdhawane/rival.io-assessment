import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { signupSchema, loginSchema } from '../utils/validations'

export class AuthController {
  async signup(req: Request, res: Response) {
    console.log('[AuthController] signup - request body:', req.body)
    try {
      const validatedData = signupSchema.parse(req.body)
      console.log('[AuthController] signup - validated data:', validatedData)
      const result = await authService.signup(validatedData)
      console.log('[AuthController] signup - user created:', result.user)

      // Set httpOnly cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: true, // Always true for cross-domain
        sameSite: 'none', // Required for cross-domain
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.status(201).json({
        success: true,
        data: { user: result.user, token: result.token },
      })
    } catch (error: any) {
      console.error('[AuthController] signup - error:', error)
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Signup failed',
          code: 'SIGNUP_ERROR',
        },
      })
    }
  }

  async login(req: Request, res: Response) {
    console.log('[AuthController] login - request body:', req.body)
    try {
      const validatedData = loginSchema.parse(req.body)
      console.log('[AuthController] login - validated data:', validatedData)
      const result = await authService.login(validatedData)
      console.log('[AuthController] login - user logged in:', result.user)

      // Set httpOnly cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: true, // Always true for cross-domain
        sameSite: 'none', // Required for cross-domain
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.status(200).json({
        success: true,
        data: { user: result.user, token: result.token },
      })
    } catch (error: any) {
      console.error('[AuthController] login - error:', error)
      res.status(401).json({
        success: false,
        error: {
          message: error.message || 'Login failed',
          code: 'LOGIN_ERROR',
        },
      })
    }
  }

  async logout(req: Request, res: Response) {
    console.log('[AuthController] logout - request received')
    res.clearCookie('token')
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  }

  async me(req: Request, res: Response) {
    console.log('[AuthController] me - request received')
    try {
      const userId = (req as any).user?.userId
      console.log('[AuthController] me - userId:', userId)
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        })
      }

      const user = await authService.getUserById(userId)
      console.log('[AuthController] me - user retrieved:', user)
      res.status(200).json({
        success: true,
        data: { user },
      })
    } catch (error: any) {
      console.error('[AuthController] me - error:', error)
      res.status(401).json({
        success: false,
        error: {
          message: error.message || 'Failed to get user',
          code: 'GET_USER_ERROR',
        },
      })
    }
  }

  async updatePreferences(req: Request, res: Response) {
    console.log('[AuthController] updatePreferences - request body:', req.body)
    try {
      const userId = (req as any).user?.userId
      console.log('[AuthController] updatePreferences - userId:', userId)
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
      console.log('[AuthController] updatePreferences - themePreference:', themePreference)
      const user = await authService.updateThemePreference(userId, themePreference)
      console.log('[AuthController] updatePreferences - user updated:', user)

      res.status(200).json({
        success: true,
        data: { themePreference: user.themePreference },
      })
    } catch (error: any) {
      console.error('[AuthController] updatePreferences - error:', error)
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

export const authController = new AuthController()
