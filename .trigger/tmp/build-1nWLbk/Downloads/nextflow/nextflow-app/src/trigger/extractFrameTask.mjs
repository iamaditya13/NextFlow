import {
  uploadToTransloadit
} from "../../../../../chunk-7T7IIN5Z.mjs";
import {
  prisma
} from "../../../../../chunk-CTTIZCMF.mjs";
import {
  task
} from "../../../../../chunk-HM4JK3DY.mjs";
import "../../../../../chunk-WC7F3RM6.mjs";
import {
  __name,
  init_esm
} from "../../../../../chunk-KUOAKOUY.mjs";

// src/trigger/extractFrameTask.ts
init_esm();

// src/lib/nodeRunners/extractFrame.ts
init_esm();
import { execFile } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
var DEFAULT_MAX_BUFFER = 10 * 1024 * 1024;
var DEFAULT_COMMAND_TIMEOUT_MS = 9e4;
function runCommand(command, args, timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { maxBuffer: DEFAULT_MAX_BUFFER, timeout: timeoutMs },
      (error, stdout, stderr) => {
        if (error) {
          const details = (stderr || stdout || error.message || "").toString().trim();
          const timeoutInfo = typeof error.killed === "boolean" && error.killed ? ` (timed out after ${timeoutMs}ms)` : "";
          reject(
            new Error(
              `${command} ${args.join(" ")} failed${timeoutInfo}: ${details || error.message || "unknown error"}`
            )
          );
          return;
        }
        resolve((stdout || "").toString());
      }
    );
  });
}
__name(runCommand, "runCommand");
function ensureHttpUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`videoUrl must be http(s), received protocol "${url.protocol}"`);
  }
}
__name(ensureHttpUrl, "ensureHttpUrl");
function parseTimecodeToSeconds(value) {
  const segments = value.split(":").map((segment) => Number.parseFloat(segment));
  if (segments.some((segment) => !Number.isFinite(segment) || segment < 0)) {
    return null;
  }
  if (segments.length === 2) {
    return segments[0] * 60 + segments[1];
  }
  if (segments.length === 3) {
    return segments[0] * 3600 + segments[1] * 60 + segments[2];
  }
  return null;
}
__name(parseTimecodeToSeconds, "parseTimecodeToSeconds");
async function resolveTimestampSeconds(videoUrl, timestamp, ffprobePath) {
  const normalized = timestamp.trim();
  if (normalized.length === 0) {
    return "0";
  }
  if (normalized.endsWith("%")) {
    const percentRaw = Number.parseFloat(normalized.slice(0, -1));
    if (!Number.isFinite(percentRaw)) {
      throw new Error(`Invalid timestamp percentage "${timestamp}"`);
    }
    const percent = Math.min(100, Math.max(0, percentRaw)) / 100;
    const durationOutput = await runCommand(ffprobePath, [
      "-v",
      "quiet",
      "-rw_timeout",
      "30000000",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      videoUrl
    ], 3e4);
    const duration = Number.parseFloat(durationOutput.trim());
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Unable to determine video duration for percentage timestamp");
    }
    return String(Math.max(0, Math.floor(duration * percent)));
  }
  if (normalized.includes(":")) {
    const asSeconds = parseTimecodeToSeconds(normalized);
    if (asSeconds === null) {
      throw new Error(`Invalid timestamp timecode "${timestamp}"`);
    }
    return String(Math.max(0, asSeconds));
  }
  const numeric = Number.parseFloat(normalized);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error(`Invalid timestamp value "${timestamp}"`);
  }
  return String(numeric);
}
__name(resolveTimestampSeconds, "resolveTimestampSeconds");
function makeOutputPath() {
  const tmpDir = os.tmpdir();
  return path.join(tmpDir, `frame_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`);
}
__name(makeOutputPath, "makeOutputPath");
async function runExtractFrame(params) {
  ensureHttpUrl(params.videoUrl);
  const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
  const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";
  const outputPath = makeOutputPath();
  const startTime = Date.now();
  console.log("[nodeRunner:extract-frame] start", {
    ffmpegPath,
    ffprobePath,
    videoUrl: params.videoUrl,
    timestamp: params.timestamp,
    outputPath
  });
  try {
    const seconds = await resolveTimestampSeconds(params.videoUrl, params.timestamp, ffprobePath);
    await runCommand(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-rw_timeout",
      "90000000",
      "-ss",
      seconds,
      "-i",
      params.videoUrl,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      "-y",
      outputPath
    ], 9e4);
    const fileExists = fs.existsSync(outputPath);
    if (!fileExists) {
      throw new Error("Extract-frame output file was not generated");
    }
    const fileSize = fs.statSync(outputPath).size;
    if (fileSize <= 0) {
      throw new Error("Extract-frame output file is empty");
    }
    const url = await uploadToTransloadit(outputPath, "image/jpeg");
    console.log("[nodeRunner:extract-frame] success", {
      outputPath,
      fileSize,
      timestampSeconds: seconds,
      durationMs: Date.now() - startTime
    });
    return { url, timestamp: seconds };
  } catch (error) {
    console.error("[nodeRunner:extract-frame] failed", error);
    throw error;
  } finally {
    try {
      fs.unlinkSync(outputPath);
    } catch {
    }
  }
}
__name(runExtractFrame, "runExtractFrame");

// src/trigger/extractFrameTask.ts
var extractFrameTask = task({
  id: "extract-frame",
  maxDuration: 300,
  run: /* @__PURE__ */ __name(async (payload) => {
    const { videoUrl, timestamp, runId, nodeId } = payload;
    const startTime = Date.now();
    const taskPrefix = `[trigger-task:extract-frame] [runId:${runId}] [nodeId:${nodeId}]`;
    console.log(`${taskPrefix} payload received`, {
      videoUrl,
      timestamp
    });
    if (runId !== "__standalone__") {
      await prisma.nodeResult.updateMany({
        where: { runId, nodeId },
        data: {
          status: "RUNNING",
          startedAt: /* @__PURE__ */ new Date()
        }
      });
    }
    try {
      const result = await runExtractFrame({
        videoUrl,
        timestamp
      });
      const duration = Date.now() - startTime;
      console.log(`${taskPrefix} completed`, {
        durationMs: duration,
        outputUrl: result.url,
        timestamp: result.timestamp
      });
      if (runId !== "__standalone__") {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: "SUCCESS",
            outputs: { url: result.url, timestamp: result.timestamp },
            completedAt: /* @__PURE__ */ new Date(),
            duration
          }
        });
      }
      return { url: result.url, timestamp: result.timestamp };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
      console.error(`${taskPrefix} failed`, error);
      if (runId !== "__standalone__") {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: "FAILED",
            error: message,
            completedAt: /* @__PURE__ */ new Date(),
            duration
          }
        });
      }
      throw error;
    }
  }, "run")
});
export {
  extractFrameTask
};
//# sourceMappingURL=extractFrameTask.mjs.map
