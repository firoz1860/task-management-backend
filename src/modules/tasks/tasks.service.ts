import { PrismaClient } from '@prisma/client'
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './tasks.dto'

const prisma = new PrismaClient()

export class TasksService {
  async getTasks(userId: string, query: TaskQueryDto) {
    const { page, limit, status, priority, search, sortBy, sortOrder } = query
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ])

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getTask(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } })
    if (!task) {
      const err: any = new Error('Task not found')
      err.statusCode = 404
      throw err
    }
    return task
  }

  async createTask(userId: string, data: CreateTaskDto) {
    return prisma.task.create({
      data: {
        ...data,
        userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDto) {
    await this.getTask(taskId, userId)
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
      },
    })
  }

  async deleteTask(taskId: string, userId: string) {
    await this.getTask(taskId, userId)
    await prisma.task.delete({ where: { id: taskId } })
    return { message: 'Task deleted successfully' }
  }

  async toggleTask(taskId: string, userId: string) {
    const task = await this.getTask(taskId, userId)
    const statusCycle: Record<string, string> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING',
    }
    return prisma.task.update({
      where: { id: taskId },
      data: { status: statusCycle[task.status] as any },
    })
  }

  async getStats(userId: string) {
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    ])
    return { total, pending, inProgress, completed }
  }
}
