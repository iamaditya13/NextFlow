import { defineConfig } from '@trigger.dev/sdk/v3'

const projectId = process.env.TRIGGER_PROJECT_ID

if (!projectId) {
  throw new Error(
    'Missing TRIGGER_PROJECT_ID. Set it in .env.local and in production before starting Trigger.dev workers.'
  )
}

export default defineConfig({
  project: projectId,
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 300,
  dirs: ['./src/trigger'],
})
