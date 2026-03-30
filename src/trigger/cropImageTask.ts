import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'

interface CropPayload {
  imageUrl: string
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent: number
  runId: string
  nodeId: string
}

export const cropImageTask = task({
  id: 'crop-image',
  maxDuration: 300,

  run: async (payload: CropPayload) => {
    const {
      imageUrl,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      runId,
      nodeId,
    } = payload

    const startTime = Date.now()
    const taskPrefix = `[trigger-task:crop-image] [runId:${runId}] [nodeId:${nodeId}]`
    console.log(`${taskPrefix} payload received`, {
      imageUrl,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
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
      const { runCropImage } = await import('@/lib/nodeRunners/cropImage')
      const result = await runCropImage({
        imageUrl,
        xPercent,
        yPercent,
        widthPercent,
        heightPercent,
      })
      const duration = Date.now() - startTime
      console.log(`${taskPrefix} completed`, { durationMs: duration, outputUrl: result.url })

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'SUCCESS',
            outputs: { url: result.url },
            completedAt: new Date(),
            duration,
          },
        })
      }

      return { url: result.url }
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
