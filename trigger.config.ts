import { defineConfig } from '@trigger.dev/sdk/v3'
import { ffmpeg } from '@trigger.dev/build/extensions/core'
import { getTriggerProjectId } from './src/lib/env/getTriggerEnv'

const projectId = getTriggerProjectId({ allowMissing: true }) || '__MISSING_TRIGGER_PROJECT_ID__'

export default defineConfig({
  project: projectId,
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 300,
  dirs: ['./src/trigger'],
  build: {
    extensions: [ffmpeg({ version: '7' })],
  },
})
