import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const token = ctx.request.header('Authorization')?.split(' ')[1]

      if (!token) {
        return ctx.response.status(400).json({ msg: 'Token not found in headers' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
      ctx.email = decoded.email

      await next()
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong in middleware',
      })
    }

    await next()
  }
}
