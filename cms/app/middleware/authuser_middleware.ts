import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default class AuthuserMiddleware {
  async handle({ request, response }: HttpContext, ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    let token = request.header('Authorization')?.split(' ')[1]

    if (!token) {
      return response.status(400).json({
        msg: 'Token not found in the headers',
      })
    }

    let decoded = jwt.decode(token)
    let email = (decoded as jwt.JwtPayload).email

    

    console.log(ctx)

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
