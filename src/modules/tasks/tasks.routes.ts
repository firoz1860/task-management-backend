import { Router } from 'express'
import { getTasks, getTask, createTask, updateTask, deleteTask, toggleTask, getStats } from './tasks.controller'
import { validate, validateQuery } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from './tasks.dto'

const router = Router()

router.use(authenticateToken)

router.get('/', validateQuery(taskQuerySchema), getTasks)
router.get('/stats', getStats)
router.post('/', validate(createTaskSchema), createTask)
router.get('/:id', getTask)
router.patch('/:id', validate(updateTaskSchema), updateTask)
router.delete('/:id', deleteTask)
router.patch('/:id/toggle', toggleTask)

export default router
