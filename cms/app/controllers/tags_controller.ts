import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class TagsController {
  public async createTag(ctx: HttpContext) {
    try {
      let { name, slug } = ctx.request.only(['name', 'slug'])
      if (!name || !slug) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let tagExists = await prisma.tags.findFirst({
        where: {
          slug,
        },
      })

      if (tagExists) {
        ctx.response.status(409).json({
          msg: 'A tag with this slug already exists',
        })
      }

      await prisma.tags.create({
        data: {
          name,
          slug,
        },
      })

      ctx.response.status(200).json({
        msg: 'Tag created successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async fetchTag(ctx: HttpContext) {
    try {
      let tags = await prisma.tags.findMany({})

      if (!tags) {
        return ctx.response.status(404).json({
          msg: 'No tags found in db',
        })
      }

      ctx.response.status(200).json({
        tags,
      })
    } catch (error) {
      ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteTag(ctx: HttpContext) {
    try {
      let tagId = Number(ctx.params.tagId)
      if (!tagId) {
        return ctx.response.status(400).json({
          msg: 'Tag id not present in the params',
        })
      }

      let tagExists = await prisma.tags.findFirst({
        where: {
          id: tagId,
        },
      })

      if (!tagExists) {
        return ctx.response.status(404).json({
          msg: 'Tag doesnt exists',
        })
      }

      await prisma.tags.delete({
        where: {
          id: tagId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Tag deleted successfully',
      })
    } catch (error) {
      ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async updateTag(ctx: HttpContext) {
    try {
      let tagId = Number(ctx.params.tagId)
      if (!tagId) {
        return ctx.response.status(400).json({
          msg: 'No tag id present in the params',
        })
      }

      let tagExists = await prisma.tags.findFirst({
        where: {
          id: tagId,
        },
      })

      if (!tagExists) {
        return ctx.response.status(404).json({
          msg: 'No tag with such id found in db',
        })
      }

      let name = ctx.request.input('name')
      let slug = ctx.request.input('slug')

      let fieldsToUpdate: Record<string, any> = {}

      if (name) fieldsToUpdate.name = name
      if (slug) fieldsToUpdate.slug = slug

      if (Object.keys(fieldsToUpdate).length === 0) {
        return ctx.response.status(400).json({
          msg: 'No changes detected to update',
        })
      }

      await prisma.tags.update({
        where: {
          id: tagId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Tag updated successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
