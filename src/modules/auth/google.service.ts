import { PrismaClient } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'
import { hashPassword } from '../../utils/hash'

const prisma = new PrismaClient()

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
})

export class GoogleAuthService {
  async verifyToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      return ticket.getPayload()
    } catch (error) {
      throw new Error('Invalid Google token')
    }
  }

  async handleGoogleLogin(token: string) {
    const payload = await this.verifyToken(token)
    if (!payload || !payload.email || !payload.sub) {
      throw new Error('Invalid Google token payload')
    }

    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    })

    if (!user) {
      // Check if user exists by email (for linking accounts)
      const existingEmail = await prisma.user.findUnique({
        where: { email: payload.email },
      })

      if (existingEmail) {
        // Link Google to existing account
        user = await prisma.user.update({
          where: { email: payload.email },
          data: {
            googleId: payload.sub,
            provider: 'google',
          },
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            googleId: payload.sub,
            provider: 'google',
          },
        })
      }
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    const hashedRefresh = await hashPassword(refreshToken)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    })

    const { password, refreshToken: _, ...safeUser } = user
    return { user: safeUser, accessToken, refreshToken }
  }

  async getAuthorizationUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    })

    return authUrl
  }

  async handleAuthorizationCode(code: string) {
    try {
      const { tokens } = await googleClient.getToken(code)
      if (!tokens.id_token) {
        throw new Error('No ID token received')
      }
      return await this.handleGoogleLogin(tokens.id_token)
    } catch (error) {
      throw new Error('Failed to exchange authorization code')
    }
  }
}
