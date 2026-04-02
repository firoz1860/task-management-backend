import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  })
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  })
}

export const verifyAccessToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string }
  } catch {
    return null
  }
}
