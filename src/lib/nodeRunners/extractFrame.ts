import { execFile } from 'child_process'
import ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { uploadToTransloadit } from '@/trigger/utils/uploadToTransloadit'

const DEFAULT_MAX_BUFFER = 10 * 1024 * 1024
const DEFAULT_COMMAND_TIMEOUT_MS = 90_000

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

export interface ExtractFrameParams {
  videoUrl: string
  timestamp: string
}

function runCommand(
  command: string,
  args: string[],
  timeoutMs: number = DEFAULT_COMMAND_TIMEOUT_MS
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { maxBuffer: DEFAULT_MAX_BUFFER, timeout: timeoutMs },
      (error, stdout, stderr) => {
        if (error) {
          const details = (stderr || stdout || error.message || '').toString().trim()
          const timeoutInfo =
            typeof (error as { killed?: boolean }).killed === 'boolean' &&
            (error as { killed?: boolean }).killed
              ? ` (timed out after ${timeoutMs}ms)`
              : ''
          reject(
            new Error(
              `${command} ${args.join(' ')} failed${timeoutInfo}: ${
                details || error.message || 'unknown error'
              }`
            )
          )
          return
        }
        resolve((stdout || '').toString())
      }
    )
  })
}

function ensureHttpUrl(rawUrl: string): void {
  const url = new URL(rawUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`videoUrl must be http(s), received protocol "${url.protocol}"`)
  }
}

function parseTimecodeToSeconds(value: string): number | null {
  const segments = value.split(':').map((segment) => Number.parseFloat(segment))
  if (segments.some((segment) => !Number.isFinite(segment) || segment < 0)) {
    return null
  }

  if (segments.length === 2) {
    return segments[0] * 60 + segments[1]
  }

  if (segments.length === 3) {
    return segments[0] * 3600 + segments[1] * 60 + segments[2]
  }

  return null
}

async function resolveTimestampSeconds(
  videoUrl: string,
  timestamp: string,
  ffprobePath: string
): Promise<string> {
  const normalized = timestamp.trim()
  if (normalized.length === 0) {
    return '0'
  }

  if (normalized.endsWith('%')) {
    const percentRaw = Number.parseFloat(normalized.slice(0, -1))
    if (!Number.isFinite(percentRaw)) {
      throw new Error(`Invalid timestamp percentage "${timestamp}"`)
    }

    const percent = Math.min(100, Math.max(0, percentRaw)) / 100
    const durationOutput = await runCommand(ffprobePath, [
      '-v',
      'quiet',
      '-rw_timeout',
      '30000000',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      videoUrl,
    ], 30_000)
    const duration = Number.parseFloat(durationOutput.trim())
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Unable to determine video duration for percentage timestamp')
    }

    return String(Math.max(0, Math.floor(duration * percent)))
  }

  if (normalized.includes(':')) {
    const asSeconds = parseTimecodeToSeconds(normalized)
    if (asSeconds === null) {
      throw new Error(`Invalid timestamp timecode "${timestamp}"`)
    }
    return String(Math.max(0, asSeconds))
  }

  const numeric = Number.parseFloat(normalized)
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error(`Invalid timestamp value "${timestamp}"`)
  }
  return String(numeric)
}

function makeOutputPath(): string {
  const tmpDir = os.tmpdir()
  return path.join(tmpDir, `frame_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`)
}

export async function runExtractFrame(
  params: ExtractFrameParams
): Promise<{ url: string; timestamp: string }> {
  ensureHttpUrl(params.videoUrl)
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg') as {
    default?: { path?: string }
    path?: string
  }
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe') as {
    default?: { path?: string }
    path?: string
  }
  const ffmpegPath = resolveInstallerPath(
    ffmpegInstaller,
    'ffmpeg'
  )
  const ffprobePath = resolveInstallerPath(
    ffprobeInstaller,
    'ffprobe'
  )
  ffmpeg.setFfmpegPath(ffmpegPath)
  ffmpeg.setFfprobePath(ffprobePath)
  console.log('Resolved ffmpeg path:', ffmpegPath)
  console.log('Resolved ffprobe path:', ffprobePath)
  const outputPath = makeOutputPath()
  const startTime = Date.now()

  console.log('[nodeRunner:extract-frame] start', {
    ffmpegPath,
    ffprobePath,
    videoUrl: params.videoUrl,
    timestamp: params.timestamp,
    outputPath,
  })

  try {
    const seconds = await resolveTimestampSeconds(params.videoUrl, params.timestamp, ffprobePath)

    await runCommand(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-rw_timeout',
      '90000000',
      '-ss',
      seconds,
      '-i',
      params.videoUrl,
      '-frames:v',
      '1',
      '-q:v',
      '2',
      '-y',
      outputPath,
    ], 90_000)

    const fileExists = fs.existsSync(outputPath)
    if (!fileExists) {
      throw new Error('Extract-frame output file was not generated')
    }

    const fileSize = fs.statSync(outputPath).size
    if (fileSize <= 0) {
      throw new Error('Extract-frame output file is empty')
    }

    const url = await uploadToTransloadit(outputPath, 'image/jpeg')
    console.log('[nodeRunner:extract-frame] success', {
      outputPath,
      fileSize,
      timestampSeconds: seconds,
      durationMs: Date.now() - startTime,
    })
    return { url, timestamp: seconds }
  } catch (error: unknown) {
    console.error('[nodeRunner:extract-frame] failed', error)
    throw error
  } finally {
    try {
      fs.unlinkSync(outputPath)
    } catch {}
  }
}
