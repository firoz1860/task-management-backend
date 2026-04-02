import { Request, Response, NextFunction } from 'express'
import { GoogleAuthService } from './google.service'
import { successResponse } from '../../utils/response'

const googleAuthService = new GoogleAuthService()

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token required' })
    }
    const result = await googleAuthService.handleGoogleLogin(token)
    return successResponse(res, result, 'Google login successful')
  } catch (err) {
    next(err)
  }
}

export const googleAuthUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUrl = await googleAuthService.getAuthorizationUrl()
    return successResponse(res, { authUrl }, 'Authorization URL generated')
  } catch (err) {
    next(err)
  }
}

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Authorization code required' })
    }
    const result = await googleAuthService.handleAuthorizationCode(code)
    return successResponse(res, result, 'Google callback successful')
  } catch (err) {
    next(err)
  }
}
