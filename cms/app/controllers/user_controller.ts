import type { HttpContext } from '@adonisjs/core/http'
import prisma from '#services/Prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import app from '@adonisjs/core/services/app'
import path from 'path'
import { unlink } from 'fs/promises'

dotenv.config()

export default class UserController {
  public async signup({ request, response }: HttpContext) {
    try {
      let defaultRole = await prisma.roles.findFirst({
        where: {
          name: 'BASIC',
        },
      })

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
          UserRoles: {
            create: [
              {
                role_id: defaultRole!.id,
              },
            ],
          },
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

  public async editUserDetails({ params, request, response }: HttpContext) {
    try {
      let userId = Number(params.userId)
      if (!userId) {
        return response.status(400).json({
          msg: 'No user id found in params',
        })
      }

      let name = request.input('name')
      let email = request.input('email')
      let avatarImage = request.file('avatar', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      await avatarImage?.move(app.makePath('storage/uploads'))
      let avatar = avatarImage ? `./storage/uploads/${avatarImage.fileName}` : null
      let fieldsToUpdate: Record<string, any> = {}

      if (name) fieldsToUpdate.name = name
      if (email) fieldsToUpdate.email = email
      if (avatar) {
        fieldsToUpdate.avatar = avatar
      }

      let userExists = await prisma.users.findFirst({
        where: {
          id: userId,
        },
      })

      if (!userExists) {
        return response.status(404).json({
          msg: 'No user with such id found in db',
        })
      }

      if (userExists.avatar && userExists.avatar.startsWith('./storage/uploads/')) {
        const oldAvatarPath = path.join(app.makePath(), userExists.avatar)
        try {
          await unlink(oldAvatarPath)
        } catch (err) {
          console.warn('Failed to delete old avatar:', err.message)
        }
      }
      await prisma.users.update({
        where: {
          id: userId,
        },
        data: fieldsToUpdate,
      })

      response.status(200).json({
        msg: 'User updated successfully',
      })
    } catch (error) {
      return response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteUserDetails(ctx: HttpContext) {
    try {
      let userId = Number(ctx.params.userId)

      if (!userId) {
        return ctx.response.status(400).json({
          msg: 'No user id found in params',
        })
      }

      let existingUser = await prisma.users.findFirst({
        where: {
          id: userId,
        },
      })

      if (!existingUser) {
        return ctx.response.status(404).json({
          msg: 'No user with this id found',
        })
      }

      await prisma.users.delete({
        where: {
          id: userId,
        },
      })

      ctx.response.status(200).json({
        msg: 'User deleted successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
