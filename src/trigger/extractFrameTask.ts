import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'

interface ExtractPayload {
  videoUrl: string
  timestamp: string
  runId: string
  nodeId: string
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
