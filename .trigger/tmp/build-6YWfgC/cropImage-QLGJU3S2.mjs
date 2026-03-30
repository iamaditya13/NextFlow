import {
  uploadToTransloadit
} from "./chunk-7T7IIN5Z.mjs";
import {
  require_fluent_ffmpeg
} from "./chunk-7UAO5BI7.mjs";
import {
  __name,
  __toESM,
  init_esm
} from "./chunk-KUOAKOUY.mjs";

// src/lib/nodeRunners/cropImage.ts
init_esm();
var import_fluent_ffmpeg = __toESM(require_fluent_ffmpeg());
import { execFile } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
var DEFAULT_MAX_BUFFER = 10 * 1024 * 1024;
var DEFAULT_COMMAND_TIMEOUT_MS = 9e4;
function resolveInstallerPath(module, binaryName) {
  const installerPath = module.default?.path ?? module.path;
  if (!installerPath) {
    throw new Error(`Unable to resolve ${binaryName} binary path from installer package`);
  }
  return installerPath;
}
__name(resolveInstallerPath, "resolveInstallerPath");
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
function clampPercent(value) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}
__name(clampPercent, "clampPercent");
function ensureHttpUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`imageUrl must be http(s), received protocol "${url.protocol}"`);
  }
}
__name(ensureHttpUrl, "ensureHttpUrl");
function makeOutputPath() {
  const tmpDir = os.tmpdir();
  return path.join(
    tmpDir,
    `cropped_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  );
}
__name(makeOutputPath, "makeOutputPath");
async function runCropImage(params) {
  ensureHttpUrl(params.imageUrl);
  const ffmpegInstaller = await import("./ffmpeg-O6VO4Q7J.mjs");
  const ffmpegPath = resolveInstallerPath(
    ffmpegInstaller,
    "ffmpeg"
  );
  import_fluent_ffmpeg.default.setFfmpegPath(ffmpegPath);
  console.log("ffmpeg path", ffmpegPath);
  const outputPath = makeOutputPath();
  const startTime = Date.now();
  const x = Math.min(99, clampPercent(params.xPercent));
  const y = Math.min(99, clampPercent(params.yPercent));
  const requestedWidth = Math.max(1, clampPercent(params.widthPercent));
  const requestedHeight = Math.max(1, clampPercent(params.heightPercent));
  const widthPercent = Math.max(1, Math.min(100 - x, requestedWidth));
  const heightPercent = Math.max(1, Math.min(100 - y, requestedHeight));
  const cropFilter = `crop=iw*${widthPercent}/100:ih*${heightPercent}/100:iw*${x}/100:ih*${y}/100`;
  console.log("[nodeRunner:crop-image] start", {
    ffmpegPath,
    imageUrl: params.imageUrl,
    outputPath,
    xPercent: x,
    yPercent: y,
    widthPercent,
    heightPercent
  });
  try {
    await runCommand(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-rw_timeout",
      "30000000",
      "-i",
      params.imageUrl,
      "-vf",
      cropFilter,
      "-frames:v",
      "1",
      "-y",
      outputPath
    ], 9e4);
    const fileExists = fs.existsSync(outputPath);
    if (!fileExists) {
      throw new Error("Crop output file was not generated");
    }
    const fileSize = fs.statSync(outputPath).size;
    if (fileSize <= 0) {
      throw new Error("Crop output file is empty");
    }
    const url = await uploadToTransloadit(outputPath, "image/jpeg");
    console.log("[nodeRunner:crop-image] success", {
      outputPath,
      fileSize,
      durationMs: Date.now() - startTime
    });
    return { url };
  } catch (error) {
    console.error("[nodeRunner:crop-image] failed", error);
    throw error;
  } finally {
    try {
      fs.unlinkSync(outputPath);
    } catch {
    }
  }
}
__name(runCropImage, "runCropImage");
export {
  runCropImage
};
//# sourceMappingURL=cropImage-QLGJU3S2.mjs.map
