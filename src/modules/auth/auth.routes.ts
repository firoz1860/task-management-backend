import { Router } from 'express'
import { register, login, refresh, logout, getMe, updateProfile } from './auth.controller'
import { googleLogin, googleAuthUrl, googleCallback } from './google.controller'
import { validate } from '../../middleware/validate.middleware'
import { authenticateToken } from '../../middleware/auth.middleware'
import { registerSchema, loginSchema } from './auth.dto'

const router = Router()

// Traditional auth
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', authenticateToken, logout)
router.get('/me', authenticateToken, getMe)
router.put('/profile', authenticateToken, updateProfile)

// Google OAuth
router.post('/google/login', googleLogin)
router.get('/google/auth-url', googleAuthUrl)
router.get('/google/callback', googleCallback)

export default router
