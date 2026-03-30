import { task } from '@trigger.dev/sdk/v3'
import ffmpeg from 'fluent-ffmpeg'
import { prisma } from '@/lib/prisma'

interface ExtractPayload {
  videoUrl: string
  timestamp: string
  runId: string
  nodeId: string
}

function resolveInstallerPath(
  module: { default?: { path?: string }; path?: string },
  binaryName: 'ffmpeg' | 'ffprobe'
): string {
  const installerPath = module.default?.path ?? module.path
  if (!installerPath) {
    throw new Error(`Unable to resolve ${binaryName} binary path from installer package`)
  }
  return installerPath
}

export const extractFrameTask = task({
  id: 'extract-frame',
  maxDuration: 300,

  run: async (payload: ExtractPayload) => {
    const { videoUrl, timestamp, runId, nodeId } = payload

    const startTime = Date.now()
    const taskPrefix = `[trigger-task:extract-frame] [runId:${runId}] [nodeId:${nodeId}]`
    console.log(`${taskPrefix} payload received`, {
      videoUrl,
      timestamp,
    })

    if (runId !== '__standalone__') {
      await prisma.nodeResult.updateMany({
        where: { runId, nodeId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      })
    }

    try {
      const ffmpegInstaller = await import('@ffmpeg-installer/ffmpeg')
      const ffprobeInstaller = await import('@ffprobe-installer/ffprobe')
      const ffmpegPath = resolveInstallerPath(
        ffmpegInstaller as { default?: { path?: string }; path?: string },
        'ffmpeg'
      )
      const ffprobePath = resolveInstallerPath(
        ffprobeInstaller as { default?: { path?: string }; path?: string },
        'ffprobe'
      )
      ffmpeg.setFfmpegPath(ffmpegPath)
      ffmpeg.setFfprobePath(ffprobePath)
      console.log('ffmpeg path', ffmpegPath)
      console.log('ffprobe path', ffprobePath)

      const { runExtractFrame } = await import('@/lib/nodeRunners/extractFrame')
      const result = await runExtractFrame({
        videoUrl,
        timestamp,
      })
      const duration = Date.now() - startTime
      console.log(`${taskPrefix} completed`, {
        durationMs: duration,
        outputUrl: result.url,
        timestamp: result.timestamp,
      })

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'SUCCESS',
            outputs: { url: result.url, timestamp: result.timestamp },
            completedAt: new Date(),
            duration,
          },
        })
      }

      return { url: result.url, timestamp: result.timestamp }
    } catch (error: unknown) {
      const duration = Date.now() - startTime
      const message =
        error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'

      console.error(`${taskPrefix} failed`, error)

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'FAILED',
            error: message,
            completedAt: new Date(),
            duration,
          },
        })
      }

      throw error
    }
  },
})
