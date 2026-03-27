import { task } from '@trigger.dev/sdk/v3'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { prisma } from '@/lib/prisma'
import { uploadToTransloadit } from './utils/uploadToTransloadit'

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

    if (runId !== '__standalone__') {
      await prisma.nodeResult.updateMany({
        where: { runId, nodeId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      })
    }

    const startTime = Date.now()
    const tmpDir = os.tmpdir()
    const inputPath = path.join(tmpDir, `video_${Date.now()}.mp4`)
    const outputPath = path.join(tmpDir, `frame_${Date.now()}.jpg`)

    try {
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status}`)
      }
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(inputPath, Buffer.from(buffer))

      let timeSeconds = '0'

      if (String(timestamp).includes('%')) {
        const pct = parseFloat(timestamp) / 100
        const durOutput = execSync(
          `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${inputPath}"`
        )
          .toString()
          .trim()

        const dur = parseFloat(durOutput)
        timeSeconds = String(Math.floor(dur * pct))
      } else {
        timeSeconds = String(timestamp || '0')
      }

      execSync(
        `ffmpeg -ss ${timeSeconds} -i "${inputPath}" -vframes 1 -q:v 2 -y "${outputPath}"`
      )

      const url = await uploadToTransloadit(outputPath, 'image/jpeg')
      const duration = Date.now() - startTime

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'SUCCESS',
            outputs: { url },
            completedAt: new Date(),
            duration,
          },
        })
      }

      return { url, timestamp: timeSeconds }
    } catch (error: any) {
      const duration = Date.now() - startTime

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'FAILED',
            error: error.message,
            completedAt: new Date(),
            duration,
          },
        })
      }

      throw error
    } finally {
      try {
        fs.unlinkSync(inputPath)
      } catch {}
      try {
        fs.unlinkSync(outputPath)
      } catch {}
    }
  },
})
