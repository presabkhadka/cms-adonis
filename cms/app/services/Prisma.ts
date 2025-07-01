import { PrismaClient } from '../../generated/prisma/index.js'

const prisma = await new PrismaClient()

export default prisma
