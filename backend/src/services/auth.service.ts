import bcrypt from 'bcrypt'
import { userRepository } from '../repositories/user.repository'
import { generateToken } from '../config/jwt'
import { SignupInput, LoginInput } from '../utils/validations'

export class AuthService {
  async signup(data: SignupInput) {
    console.log('[AuthService] signup - data:', data)
    const existingUser = await userRepository.findByEmail(data.email)
    console.log('[AuthService] signup - existing user:', existingUser)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    console.log('[AuthService] signup - password hashed')
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
    })
    console.log('[AuthService] signup - user created:', user)

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    console.log('[AuthService] signup - token generated')

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference,
      },
      token,
    }
  }

  async login(data: LoginInput) {
    console.log('[AuthService] login - data:', data)
    const user = await userRepository.findByEmail(data.email)
    console.log('[AuthService] login - user found:', user ? 'yes' : 'no')
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)
    console.log('[AuthService] login - password valid:', isValidPassword)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    console.log('[AuthService] login - token generated')

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference,
      },
      token,
    }
  }

  async getUserById(userId: string) {
    console.log('[AuthService] getUserById - userId:', userId)
    const user = await userRepository.findById(userId)
    console.log('[AuthService] getUserById - user found:', user ? 'yes' : 'no')
    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      themePreference: user.themePreference,
    }
  }

  async updateThemePreference(userId: string, themePreference: string) {
    console.log('[AuthService] updateThemePreference - userId:', userId, 'themePreference:', themePreference)
    const user = await userRepository.updateThemePreference(userId, themePreference)
    console.log('[AuthService] updateThemePreference - user updated:', user)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      themePreference: user.themePreference,
    }
  }
}

export const authService = new AuthService()
