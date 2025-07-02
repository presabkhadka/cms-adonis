import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class RevisionsController {
  public async fetchRevision(ctx: HttpContext) {
    try {
      let contentId = Number(ctx.params.contentId)
      if (!contentId) {
        return ctx.response.status(400).json({
          msg: 'No content id found in the params',
        })
      }

      let contentExists = await prisma.content.findFirst({
        where: {
          id: contentId,
        },
      })

      if (!contentExists) {
        return ctx.response.status(404).json({
          msg: 'No content found',
        })
      }

      let revision = await prisma.revisions.findMany({
        where: {
          content_id: contentId,
        },
      })

      if (!revision) {
        return ctx.response.status(404).json({
          msg: 'No revisions found for this contenet',
        })
      }

      ctx.response.status(200).json({
        revision,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async fetchSingleRevision(ctx: HttpContext) {
    try {
      let revisionId = Number(ctx.params.revisionId)
      if (!revisionId) {
        return ctx.response.status(400).json({
          msg: 'No revision id present in the params',
        })
      }

      let revision = await prisma.revisions.findFirst({
        where: {
          id: revisionId,
        },
      })

      if (!revision) {
        return ctx.response.status(404).json({
          msg: 'No any revision with such id found',
        })
      }

      ctx.response.status(200).json({
        revision,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
