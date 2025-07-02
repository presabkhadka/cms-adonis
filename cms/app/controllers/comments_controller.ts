import prisma from '#services/Prisma'
import { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  public async addComment(ctx: HttpContext) {
    try {
      let contentId = Number(ctx.params.contentId)
      if (!contentId) {
        return ctx.response.status(400).json({
          msg: 'No content id present in the params',
        })
      }

      let email = ctx.email

      let user = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      let comment = ctx.request.input('comment')

      if (!comment) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      await prisma.comments.create({
        data: {
          content_id: contentId,
          user_id: user!.id,
          comment,
          status: 'PENDING',
        },
      })

      ctx.response.status(200).json({
        msg: 'Comment added successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async fetchComment(ctx: HttpContext) {
    try {
      let contentId = Number(ctx.params.contentId)
      let comments = await prisma.comments.findMany({
        where: {
          content_id: contentId,
          status: 'APPROVED',
        },
      })

      if (!comments) {
        return ctx.response.status(404).json({
          msg: 'There are no any comments for this post at the moment',
        })
      }

      ctx.response.status(200).json({
        comments,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteComment(ctx: HttpContext) {
    try {
      let commentId = Number(ctx.params.commentId)
      let email = ctx.email

      let user = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      if (!commentId) {
        return ctx.response.status(400).json({
          msg: 'No comment id present in the params',
        })
      }

      let commentExists = await prisma.comments.findFirst({
        where: {
          id: commentId,
        },
      })

      if (!commentExists) {
        return ctx.response.status(404).json({
          msg: 'No comment with such id found',
        })
      }

      if (commentExists.user_id !== user!.id) {
        return ctx.response.status(409).json({
          msg: "Cannot delete other user's comment",
        })
      }
      await prisma.comments.delete({
        where: {
          id: commentId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Comment deleted successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editComment(ctx: HttpContext) {
    try {
      let commentId = Number(ctx.params.commentId)
      let email = ctx.email
      let comment = ctx.request.input('comment')

      let fieldsToUpdate: Record<string, any> = {}

      if (comment) fieldsToUpdate.comment = comment

      if (Object.keys(fieldsToUpdate).length === 0 - 0) {
        return ctx.response.status(400).json({
          msg: 'No any changes detected to update',
        })
      }

      let user = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      if (!commentId) {
        return ctx.response.status(400).json({
          msg: 'No comment id present in the params',
        })
      }

      let commentExists = await prisma.comments.findFirst({
        where: {
          id: commentId,
        },
      })

      if (!commentExists) {
        return ctx.response.status(404).json({
          msg: 'No comment with such id found',
        })
      }

      if (commentExists.user_id !== user!.id) {
        return ctx.response.status(409).json({
          msg: "Cannot edit other user's comment",
        })
      }

      await prisma.comments.update({
        where: {
          id: commentId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Comment updated successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something wrong with the server',
      })
    }
  }
}
