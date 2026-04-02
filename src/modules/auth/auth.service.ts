import { PrismaClient } from '@prisma/client'
import { RegisterDto, LoginDto } from './auth.dto'
import { hashPassword, comparePassword } from '../../utils/hash'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt'

const prisma = new PrismaClient()

export class AuthService {
  async register(data: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      const err: any = new Error('Email already in use')
      err.statusCode = 409
      throw err
    }

    const hashedPassword = await hashPassword(data.password)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    })

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    const hashedRefresh = await hashPassword(refreshToken)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    })

    const { password, refreshToken: _, ...safeUser } = user
    return { user: safeUser, accessToken, refreshToken }
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user || !user.password) {
      const err: any = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    const valid = await comparePassword(data.password, user.password)
    if (!valid) {
      const err: any = new Error('Invalid credentials')
      err.statusCode = 401
      throw err
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    const hashedRefresh = await hashPassword(refreshToken)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    })

    const { password, refreshToken: _, ...safeUser } = user
    return { user: safeUser, accessToken, refreshToken }
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      const err: any = new Error('Invalid refresh token')
      err.statusCode = 401
      throw err
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || !user.refreshToken) {
      const err: any = new Error('Invalid refresh token')
      err.statusCode = 401
      throw err
    }

    const valid = await comparePassword(refreshToken, user.refreshToken)
    if (!valid) {
      const err: any = new Error('Invalid refresh token')
      err.statusCode = 401
      throw err
    }

    const newAccessToken = generateAccessToken(user.id)
    const newRefreshToken = generateRefreshToken(user.id)
    const hashedRefresh = await hashPassword(newRefreshToken)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, provider: true },
    })
    if (!user) {
      const err: any = new Error('User not found')
      err.statusCode = 404
      throw err
    }
    return user
  }

  async updateProfile(userId: string, data: { name?: string }) {
    if (!data.name || !data.name.trim()) {
      const err: any = new Error('Name cannot be empty')
      err.statusCode = 400
      throw err
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
      },
      select: { id: true, email: true, name: true, createdAt: true, provider: true },
    })
    
    return user
  }
}
