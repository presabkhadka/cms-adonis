import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default class AdminController {
  public async adminLogin(ctx: HttpContext) {
    try {
      let { email, password } = ctx.request.only(['email', 'password'])

      if (!email || !password) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let adminExits = await prisma.users.findFirst({
        where: {
          email,
        },
        include: {
          UserRoles: true,
        },
      })

      let roleId = adminExits!.id

      let role = await prisma.roles.findFirst({
        where: {
          id: roleId,
        },
      })

      if (role?.name === 'BASIC') {
        return ctx.response.status(400).json({
          msg: 'Sorry you are not admin',
        })
      }

      if (password !== adminExits?.password) {
        return ctx.response.status(409).json({
          msg: 'Incorrect credentials',
        })
      }

      let token = jwt.sign({ email }, process.env.JWT_SECRET!)
      ctx.response.status(200).json({
        token,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async viewAllUser(ctx: HttpContext) {
    try {
      let users = await prisma.users.findMany({
        include: {
          UserRoles: true,
        },
      })

      if (!users) {
        return ctx.response.status(404).json({
          msg: 'No users found in db',
        })
      }

      ctx.response.status(200).json({
        users,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
