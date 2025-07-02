import prisma from '#services/Prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  public async createSetting(ctx: HttpContext) {
    try {
      let { key, value, group_name } = ctx.request.only(['key', 'value', 'group_name'])

      if (!key || !value || !group_name) {
        return ctx.response.status(400).json({
          msg: 'Input fields cannot be left empty',
        })
      }

      let settingsExist = await prisma.settings.findFirst({
        where: {
          key,
        },
      })

      if (settingsExist) {
        return ctx.response.status(409).json({
          msg: 'Setting with this key already exists',
        })
      }

      await prisma.settings.create({
        data: {
          key,
          value,
          group_name,
        },
      })

      ctx.response.status(200).json({
        msg: 'Settings created successfully',
      })
    } catch (error) {
      return ctx.response.status(200).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async editSettings(ctx: HttpContext) {
    try {
      let settingsId = Number(ctx.params.settingsId)
      if (!settingsId) {
        return ctx.response.status(400).json({
          msg: 'No settings id present in the params',
        })
      }

      let { key, value, group_name } = ctx.request.only(['key', 'value', 'group_name'])

      let settingsExists = await prisma.settings.findFirst({
        where: {
          id: settingsId,
        },
      })

      if (!settingsExists) {
        return ctx.response.status(404).json({
          msg: 'No setting with such id found',
        })
      }

      let fieldsToUpdate: Record<string, any> = {}

      if (key) fieldsToUpdate.key = key
      if (value) fieldsToUpdate.value = value
      if (group_name) fieldsToUpdate.group_name = group_name

      if (Object.keys(fieldsToUpdate).length === 0) {
        return ctx.response.status(400).json({
          msg: 'No changes found to update',
        })
      }

      await prisma.settings.update({
        where: {
          id: settingsId,
        },
        data: fieldsToUpdate,
      })

      ctx.response.status(200).json({
        msg: 'Settings updated successfully',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async fetchSetting(ctx: HttpContext) {
    try {
      let settings = await prisma.settings.findMany({})

      if (!settings) {
        return ctx.response.status(404).json({
          msg: 'No settings found at the moment',
        })
      }

      ctx.response.status(200).json({
        settings,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }

  public async deleteSettings(ctx: HttpContext) {
    try {
      let settingsId = Number(ctx.params.settingsId)
      if (!settingsId) {
        return ctx.response.status(400).json({
          msg: 'No settings id present in the params',
        })
      }

      let settingsExists = await prisma.settings.findFirst({
        where: {
          id: settingsId,
        },
      })

      if (!settingsExists) {
        return ctx.response.status(404).json({
          msg: 'No settings with such id found',
        })
      }

      await prisma.settings.delete({
        where: {
          id: settingsId,
        },
      })

      ctx.response.status(200).json({
        msg: 'Settings deleted',
      })
    } catch (error) {
      return ctx.response.status(500).json({
        msg: error instanceof Error ? error.message : 'Something went wrong with the server',
      })
    }
  }
}
