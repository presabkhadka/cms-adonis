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
      let finalUser = await prisma.users.findMany({
        include: {
          UserRoles: true,
        },
      })

      if (!finalUser) {
        return ctx.response.status(404).json({
          msg: 'No users found in db',
        })
      }

      let users = finalUser.filter((x) => x.UserRoles.some((role) => role.role_id === 1))

      ctx.response.status(200).json({
        users,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async totalContents(ctx: HttpContext) {
    try {
      let contents = await prisma.content.findMany({})

      if (!contents) {
        return ctx.response.status(404).json({
          msg: 'No any contents found',
        })
      }

      let totalContents = contents.length

      ctx.response.status(200).json({
        totalContents,
      })
    } catch (error) {
      ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async totalUsers(ctx: HttpContext) {
    try {
      let users = await prisma.users.findMany({})

      if (!users) {
        return ctx.response.status(404).json({
          msg: 'No users found in db',
        })
      }

      let totalUsers = users.length

      ctx.response.status(200).json({
        totalUsers,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async totalCategories(ctx: HttpContext) {
    try {
      let categories = await prisma.categories.findMany({})

      if (!categories) {
        return ctx.response.status(404).json({
          msg: 'No categories found in db',
        })
      }

      let totalCategories = categories.length

      ctx.response.status(200).json({
        totalCategories,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Somethingw went wrong with the server',
      })
    }
  }

  public async publishContent(ctx: HttpContext) {
    try {
      let contentId = Number(ctx.params.contentId)
      if (!contentId) {
        return ctx.response.status(400).json({
          msg: 'No content id present in the params',
        })
      }

      let contentExists = await prisma.content.findFirst({
        where: {
          id: contentId,
        },
      })

      if (!contentExists) {
        return ctx.response.status(404).json({
          msg: 'Content with such id not found in db',
        })
      }

      if (contentExists.status === 'PUBLISHED') {
        return ctx.response.status(400).json({
          msg: 'Content is already published',
        })
      }

      await prisma.content.update({
        where: {
          id: contentId,
        },
        data: {
          status: 'PUBLISHED',
        },
      })

      ctx.response.status(200).json({
        msg: 'Content published successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Somethign went wrong with the server',
      })
    }
  }

  public async draftContent(ctx: HttpContext) {
    try {
      let contentId = Number(ctx.params.contentId)
      if (!contentId) {
        return ctx.response.status(400).json({
          msg: 'No content id present in the params',
        })
      }

      let contentExists = await prisma.content.findFirst({
        where: {
          id: contentId,
        },
      })

      if (!contentExists) {
        return ctx.response.status(404).json({
          msg: 'No content with such id found',
        })
      }

      if (contentExists.status === 'DRAFT') {
        return ctx.response.status(400).json({
          msg: 'Content is already in draft state',
        })
      }

      await prisma.content.update({
        where: {
          id: contentId,
        },
        data: {
          status: 'DRAFT',
        },
      })

      ctx.response.status(200).json({
        msg: 'Content status set to draft',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
