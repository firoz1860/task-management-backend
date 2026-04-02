import { Request, Response, NextFunction } from 'express'
import { TasksService } from './tasks.service'
import { successResponse } from '../../utils/response'

const tasksService = new TasksService()

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tasksService.getTasks(req.user!.userId, req.query as any)
    return successResponse(res, result, 'Tasks retrieved')
  } catch (err) { next(err) }
}

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.getTask(req.params.id, req.user!.userId)
    return successResponse(res, task, 'Task retrieved')
  } catch (err) { next(err) }
}

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.createTask(req.user!.userId, req.body)
    return successResponse(res, task, 'Task created', 201)
  } catch (err) { next(err) }
}

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.updateTask(req.params.id, req.user!.userId, req.body)
    return successResponse(res, task, 'Task updated')
  } catch (err) { next(err) }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tasksService.deleteTask(req.params.id, req.user!.userId)
    return successResponse(res, result, 'Task deleted')
  } catch (err) { next(err) }
}

export const toggleTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.toggleTask(req.params.id, req.user!.userId)
    return successResponse(res, task, 'Task status updated')
  } catch (err) { next(err) }
}

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await tasksService.getStats(req.user!.userId)
    return successResponse(res, stats, 'Stats retrieved')
  } catch (err) { next(err) }
}
