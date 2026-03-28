import { task } from '@trigger.dev/sdk/v3'
import { execFile } from 'child_process'
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
    const runCommand = (command: string, args: string[]) =>
      new Promise<string>((resolve, reject) => {
        execFile(
          command,
          args,
          { maxBuffer: 10 * 1024 * 1024 },
          (error, stdout, stderr) => {
            if (error) {
              const details = (stderr || stdout || error.message || '').toString().trim()
              reject(new Error(details || `${command} failed`))
              return
            }
            resolve((stdout || '').toString())
          }
        )
      })

    const clampPercent = (value: number) =>
      Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))

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
    const outputPath = path.join(tmpDir, `cropped_${Date.now()}.jpg`)

    try {
      // Use ffmpeg directly on the source URL to avoid an extra download-to-disk hop.
      const x = clampPercent(xPercent)
      const y = clampPercent(yPercent)
      const w = Math.max(1, clampPercent(widthPercent))
      const h = Math.max(1, clampPercent(heightPercent))

      const xExpr = `floor(max(0,min(iw*${x}/100,iw-1)))`
      const yExpr = `floor(max(0,min(ih*${y}/100,ih-1)))`
      const wExpr = `max(1,floor(min(iw*${w}/100,iw-(${xExpr}))))`
      const hExpr = `max(1,floor(min(ih*${h}/100,ih-(${yExpr}))))`
      const cropFilter = `crop=${wExpr}:${hExpr}:${xExpr}:${yExpr}`

      await runCommand('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        imageUrl,
        '-vf',
        cropFilter,
        '-frames:v',
        '1',
        '-y',
        outputPath,
      ])

      const fileExists = fs.existsSync(outputPath)
      if (!fileExists) {
        throw new Error('Crop output file was not generated')
      }

      const fileSize = fs.statSync(outputPath).size
      if (fileSize <= 0) {
        throw new Error('Crop output file is empty')
      }

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
        fs.unlinkSync(outputPath)
      } catch {}
    }
  },
})
