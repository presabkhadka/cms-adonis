import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  public async createCategory(ctx: HttpContext) {
    try {
      let { name, description, parent_id } = ctx.request.only(['name', 'description', 'parent_id'])

      if (!name || !description) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left emtpy',
        })
      }

      let categoryExists = await prisma.categories.findFirst({
        where: {
          name,
        },
      })

      if (categoryExists) {
        return ctx.response.status(409).json({
          msg: 'Category with this name already exists',
        })
      }

      await prisma.categories.create({
        data: {
          name,
          description,
          parent_id,
        },
      })

      ctx.response.status(200).json({
        msg: 'Category created successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async fetchCategory(ctx: HttpContext) {
    try {
      let category = await prisma.categories.findMany({})

      if (!category) {
        return ctx.response.status(404).json({
          msg: 'No any category present at the moment',
        })
      }

      ctx.response.status(200).json({
        category,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editCategory(ctx: HttpContext) {
    try {
      let categoryId = Number(ctx.params.categoryId)
      if (!categoryId) {
        return ctx.response.status(400).json({
          msg: 'Category with this id not found',
        })
      }
      let name = ctx.request.input('name')
      let description = ctx.request.input('description')
      let parent_id = ctx.request.input('parent_id')

      let categoryExists = await prisma.categories.findFirst({
        where: {
          id: categoryId,
        },
      })

      if (!categoryExists) {
        return ctx.response.status(404).json({
          msg: 'Category with such id not found',
        })
      }

      let fieldsToUpdate: Record<string, any> = {}

      if (name) fieldsToUpdate.name = name
      if (description) fieldsToUpdate.description = description
      if (parent_id) fieldsToUpdate.parent_id = parent_id

      if (Object.keys(fieldsToUpdate).length === 0) {
        return ctx.response.status(400).json({
          msg: 'No any changes found to update',
        })
      }

      await prisma.categories.update({
        where: {
          id: categoryId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Category upadated successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteCateogry(ctx: HttpContext) {
    try {
      let categoryId = Number(ctx.params.categoryId)
      if (!categoryId) {
        return ctx.response.status(400).json({
          msg: 'No category id present in params',
        })
      }

      let categoryExists = await prisma.categories.findFirst({
        where: {
          id: categoryId,
        },
      })

      if (!categoryExists) {
        return ctx.response.status(404).json({
          msg: 'No category with such id present',
        })
      }

      await prisma.categories.delete({
        where: {
          id: categoryId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Category deleted successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Somethign went wrong with the server',
      })
    }
  }
}
