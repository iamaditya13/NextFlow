import { task } from '@trigger.dev/sdk/v3'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { prisma } from '@/lib/prisma'
import { uploadToTransloadit } from './utils/uploadToTransloadit'

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
    const inputPath = path.join(tmpDir, `input_${Date.now()}.jpg`)
    const outputPath = path.join(tmpDir, `cropped_${Date.now()}.jpg`)

    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(inputPath, Buffer.from(buffer))

      const probeOutput = execSync(
        `ffprobe -v quiet -print_format json -show_streams "${inputPath}"`
      ).toString()

      const probe = JSON.parse(probeOutput)
      const stream = probe.streams.find((s: any) => s.codec_type === 'video')
      const imgW = stream?.width || 1920
      const imgH = stream?.height || 1080

      const cropW = Math.round(imgW * (widthPercent / 100))
      const cropH = Math.round(imgH * (heightPercent / 100))
      const cropX = Math.round(imgW * (xPercent / 100))
      const cropY = Math.round(imgH * (yPercent / 100))

      const safeW = Math.max(1, Math.min(cropW, imgW - cropX))
      const safeH = Math.max(1, Math.min(cropH, imgH - cropY))

      execSync(
        `ffmpeg -i "${inputPath}" -vf "crop=${safeW}:${safeH}:${cropX}:${cropY}" -y "${outputPath}"`
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

      return { url }
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
