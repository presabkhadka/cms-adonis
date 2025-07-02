import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContentsController {
  public async createContent(ctx: HttpContext) {
    try {
      let { title, slug, body, status } = ctx.request.only(['title', 'slug', 'body', 'status'])

      let category_id = Number(ctx.request.input('category_id'))

      if (!title || !slug || !body || !status) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let contentImage = ctx.request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })

      if (!contentImage) {
        return ctx.response.status(400).json({
          msg: 'A content image is required to create a content',
        })
      }

      let content = `./storage/uploads/${contentImage.fileName}`

      let email = ctx.email

      let user = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      let finalSlug = slug.replace(/ /g, '-')

      slug = finalSlug

      let contentExits = await prisma.content.findFirst({
        where: {
          slug,
        },
      })

      if (contentExits) {
        return ctx.response.status(409).json({
          msg: 'Content with this slug already exists',
        })
      }

      await prisma.content.create({
        data: {
          title,
          slug,
          body,
          status,
          image: content,
          author_id: user!.id,
          category_id,
        },
      })

      ctx.response.status(200).json({
        msg: 'Content created successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async fetchContent(ctx: HttpContext) {
    try {
      let contents = await prisma.content.findMany({
        where: {
          status: 'PUBLISHED',
        },
      })

      if (!contents) {
        return ctx.response.status(404).json({
          msg: 'Currently there are no published contents, Please visit again later',
        })
      }

      ctx.response.status(200).json({
        contents,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editContent(ctx: HttpContext) {
    try {
      let contentId = Number(ctx.params.contentId)
      if (!contentId) {
        return ctx.response.status(400).json({
          msg: 'No content id found in params',
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

      let title = ctx.request.input('title')
      let slug = ctx.request.input('slug')
      let body = ctx.request.input('body')
      let contentImage = ctx.request.file('image')
      let image = contentImage ? `./storage/uploads/${contentImage.fileName}` : null
      let category_id = Number(ctx.request.input('category_id'))

      let fieldsToUpdate: Record<string, any> = {}

      if (body) fieldsToUpdate.title = title
      if (slug) {
        let finalSlug
        finalSlug = slug.replace(/ /g, '-')
        let matchingSlug = await prisma.content.findFirst({
          where: {
            slug: finalSlug,
          },
        })

        if (matchingSlug) {
          return ctx.response.status(409).json({
            msg: "You can't have the same slug, try something unique",
          })
        }
        fieldsToUpdate.slug = finalSlug
      }
      if (body) fieldsToUpdate.body = body
      if (category_id) fieldsToUpdate.category_id = category_id
      if (image) fieldsToUpdate.image = image
      if (title) fieldsToUpdate.title = title

      await prisma.content.update({
        where: {
          id: contentId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Content updated',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
