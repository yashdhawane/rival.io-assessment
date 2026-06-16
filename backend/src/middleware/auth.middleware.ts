import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  console.log('[AuthMiddleware] authMiddleware - request received')
  console.log('[AuthMiddleware] authMiddleware - path:', req.path)
  
  // Check for token in cookies first
  let token = req.cookies.token
  
  // If not in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }
  
  console.log('[AuthMiddleware] authMiddleware - token present:', token ? 'yes' : 'no')

  if (!token) {
    console.log('[AuthMiddleware] authMiddleware - no token provided')
    return res.status(401).json({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    })
  }

  try {
    console.log('[AuthMiddleware] authMiddleware - verifying token')
    const decoded = verifyToken(token)
    console.log('[AuthMiddleware] authMiddleware - token decoded:', decoded)
    req.user = decoded
    next()
  } catch (error) {
    console.error('[AuthMiddleware] authMiddleware - invalid token:', error)
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    })
  }
}
