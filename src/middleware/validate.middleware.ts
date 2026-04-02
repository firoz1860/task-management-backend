import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { errorResponse } from '../utils/response'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return errorResponse(res, 'Validation failed', 400, errors)
    }
    req.body = result.data
    next()
  }
}

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return errorResponse(res, 'Invalid query parameters', 400, errors)
    }
    req.query = result.data as any
    next()
  }
}
