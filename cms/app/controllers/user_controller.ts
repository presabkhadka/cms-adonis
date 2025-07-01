import type { HttpContext } from '@adonisjs/core/http'
import prisma from '#services/Prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

export default class UserController {
  

  public async signup({ request, response }: HttpContext) {
    try {
      let { email, password, name } = request.only(['email', 'password', 'name'])

      if (!email || !password || !name) {
        return response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let userExists = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      if (userExists) {
        return response.status(409).json({
          msg: 'User already exists with this email address',
        })
      }

      let hashedPassword = await bcrypt.hash(password, 10)

      let user = await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          status: 'ACTIVE',
        },
      })

      return response.status(200).json({
        msg: 'User created successfully',
        user,
      })
    } catch (error) {
      return response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async login({ request, response }: HttpContext) {
    try {
      let { email, password } = request.only(['email', 'password'])

      if (!email || !password) {
        return response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let existingUser = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      if (!existingUser) {
        return response.status(404).json({
          msg: 'No user with this email registered in our db',
        })
      }

      let passwordMatch = await bcrypt.compare(password, existingUser.password)

      if (!passwordMatch) {
        return response.status(400).json({
          msg: 'Invalid credentials, Please try again',
        })
      }

      let token = jwt.sign({ email }, process.env.JWT_SECRET!)

      return response.status(200).json({
        token,
      })
    } catch (error) {
      return response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async userDetails(ctx: HttpContext) {
    try {
      let { email } = ctx

      let userDetails = await prisma.users.findFirst({
        where: {
          email,
        },
        include: {
          UserRoles: true,
        },
      })

      ctx.response.status(200).json({
        userDetails,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
