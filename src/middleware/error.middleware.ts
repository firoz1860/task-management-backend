import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { env } from '../config/env'

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (env.NODE_ENV === 'development') {
    console.error('Error:', err)
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Resource already exists' })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Resource not found' })
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  // CORS error
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ success: false, message: err.message })
  }

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
