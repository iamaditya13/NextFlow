import { task } from '@trigger.dev/sdk/v3'
import { execFile } from 'child_process'
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
    const outputPath = path.join(tmpDir, `frame_${Date.now()}.jpg`)

    try {
      let timeSeconds = '0'
      const normalizedTimestamp = String(timestamp || '0').trim()

      if (normalizedTimestamp.includes('%')) {
        const pctRaw = Number.parseFloat(normalizedTimestamp.replace('%', ''))
        const pct = Math.min(100, Math.max(0, Number.isFinite(pctRaw) ? pctRaw : 0)) / 100

        const durOutput = await runCommand('ffprobe', [
          '-v',
          'quiet',
          '-show_entries',
          'format=duration',
          '-of',
          'csv=p=0',
          videoUrl,
        ])

        const dur = Number.parseFloat(durOutput.trim())
        if (!Number.isFinite(dur) || dur <= 0) {
          throw new Error('Unable to determine video duration')
        }
        timeSeconds = String(Math.floor(dur * pct))
      } else {
        const parsed = Number.parseFloat(normalizedTimestamp)
        timeSeconds = String(Number.isFinite(parsed) ? Math.max(0, parsed) : 0)
      }

      await runCommand('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-ss',
        timeSeconds,
        '-i',
        videoUrl,
        '-frames:v',
        '1',
        '-q:v',
        '2',
        '-y',
        outputPath,
      ])

      const fileExists = fs.existsSync(outputPath)
      if (!fileExists) {
        throw new Error('Extract-frame output file was not generated')
      }

      const fileSize = fs.statSync(outputPath).size
      if (fileSize <= 0) {
        throw new Error('Extract-frame output file is empty')
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
        fs.unlinkSync(outputPath)
      } catch {}
    }
  },
})
