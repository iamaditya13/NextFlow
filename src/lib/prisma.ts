import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaAdapter: PrismaPg | undefined
}

function normalizePostgresSslMode(connectionString: string | undefined) {
  if (!connectionString) return connectionString

  try {
    const parsed = new URL(connectionString)
    const protocol = parsed.protocol.replace(':', '')
    if (protocol !== 'postgresql' && protocol !== 'postgres') return connectionString

    const sslMode = parsed.searchParams.get('sslmode')?.toLowerCase()
    const usesLibpqCompat = parsed.searchParams.get('uselibpqcompat')?.toLowerCase() === 'true'

    if (usesLibpqCompat || !sslMode) return connectionString

    if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
      parsed.searchParams.set('sslmode', 'verify-full')
      return parsed.toString()
    }

    return connectionString
  } catch {
    return connectionString
  }
}

const prismaAdapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg({
    connectionString: normalizePostgresSslMode(process.env.DATABASE_URL),
  })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: prismaAdapter,
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaAdapter = prismaAdapter
}
