import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { errorResponse } from '../utils/response'

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return errorResponse(res, 'Access token required', 401)
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    return errorResponse(res, 'Invalid or expired access token', 401)
  }

  req.user = { userId: payload.userId }
  next()
}
