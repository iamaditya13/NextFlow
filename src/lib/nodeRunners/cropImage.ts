import { execFile } from 'child_process'
import ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { uploadToTransloadit } from '@/trigger/utils/uploadToTransloadit'

export interface CropImageParams {
  imageUrl: string
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent: number
}

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

function runCommand(
  command: string,
  args: string[],
  timeoutMs: number = DEFAULT_COMMAND_TIMEOUT_MS
) {
  return new Promise<string>((resolve, reject) => {
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

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
}

function ensureHttpUrl(rawUrl: string): void {
  const url = new URL(rawUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`imageUrl must be http(s), received protocol "${url.protocol}"`)
  }
}

function makeOutputPath(): string {
  const tmpDir = os.tmpdir()
  return path.join(
    tmpDir,
    `cropped_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  )
}

export async function runCropImage(params: CropImageParams): Promise<{ url: string }> {
  ensureHttpUrl(params.imageUrl)
  const ffmpegInstaller = await import('@ffmpeg-installer/ffmpeg')
  const ffmpegPath = resolveInstallerPath(
    ffmpegInstaller as { default?: { path?: string }; path?: string },
    'ffmpeg'
  )
  ffmpeg.setFfmpegPath(ffmpegPath)
  console.log('ffmpeg path', ffmpegPath)
  const outputPath = makeOutputPath()
  const startTime = Date.now()

  const x = Math.min(99, clampPercent(params.xPercent))
  const y = Math.min(99, clampPercent(params.yPercent))
  const requestedWidth = Math.max(1, clampPercent(params.widthPercent))
  const requestedHeight = Math.max(1, clampPercent(params.heightPercent))
  const widthPercent = Math.max(1, Math.min(100 - x, requestedWidth))
  const heightPercent = Math.max(1, Math.min(100 - y, requestedHeight))

  // Keep the filter expression simple and comma-free for ffmpeg compatibility.
  const cropFilter = `crop=iw*${widthPercent}/100:ih*${heightPercent}/100:iw*${x}/100:ih*${y}/100`

  console.log('[nodeRunner:crop-image] start', {
    ffmpegPath,
    imageUrl: params.imageUrl,
    outputPath,
    xPercent: x,
    yPercent: y,
    widthPercent,
    heightPercent,
  })

  try {
    await runCommand(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-rw_timeout',
      '30000000',
      '-i',
      params.imageUrl,
      '-vf',
      cropFilter,
      '-frames:v',
      '1',
      '-y',
      outputPath,
    ], 90_000)

    const fileExists = fs.existsSync(outputPath)
    if (!fileExists) {
      throw new Error('Crop output file was not generated')
    }

    const fileSize = fs.statSync(outputPath).size
    if (fileSize <= 0) {
      throw new Error('Crop output file is empty')
    }

    const url = await uploadToTransloadit(outputPath, 'image/jpeg')
    console.log('[nodeRunner:crop-image] success', {
      outputPath,
      fileSize,
      durationMs: Date.now() - startTime,
    })
    return { url }
  } catch (error: unknown) {
    console.error('[nodeRunner:crop-image] failed', error)
    throw error
  } finally {
    try {
      fs.unlinkSync(outputPath)
    } catch {}
  }
}
