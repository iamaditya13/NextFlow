import { defineConfig } from '@trigger.dev/sdk/v3'
import { ffmpeg } from '@trigger.dev/build/extensions/core'

export default defineConfig({
  project: 'proj_zvdwgcvkkdlmmprxcctd',
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 300,
  dirs: ['./src/trigger'],
  build: {
    extensions: [ffmpeg({ version: '7' })],
  },
})
