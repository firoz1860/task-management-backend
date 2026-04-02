import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
})

export const taskQuerySchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number).refine(n => n <= 50, 'Max limit is 50'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateTaskDto = z.infer<typeof createTaskSchema>
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>
export type TaskQueryDto = z.infer<typeof taskQuerySchema>
