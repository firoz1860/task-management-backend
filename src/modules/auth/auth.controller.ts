import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { successResponse } from '../../utils/response'

const authService = new AuthService()

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body)
    return successResponse(res, result, 'Registration successful', 201)
  } catch (err) {
    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body)
    return successResponse(res, result, 'Login successful')
  } catch (err) {
    next(err)
  }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' })
    }
    const result = await authService.refresh(refreshToken)
    return successResponse(res, result, 'Tokens refreshed')
  } catch (err) {
    next(err)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user!.userId)
    return successResponse(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.userId)
    return successResponse(res, user, 'User retrieved')
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body)
    return successResponse(res, { user }, 'Profile updated successfully')
  } catch (err) {
    next(err)
  }
}
