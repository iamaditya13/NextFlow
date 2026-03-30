import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

loadEnv({ path: '.env.local' })
loadEnv()

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/db'

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: DATABASE_URL,
  },
})
