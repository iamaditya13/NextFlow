import {
  require_fluent_ffmpeg
} from "../../../../../chunk-7UAO5BI7.mjs";
import {
  prisma
} from "../../../../../chunk-CTTIZCMF.mjs";
import {
  task
} from "../../../../../chunk-HM4JK3DY.mjs";
import "../../../../../chunk-WC7F3RM6.mjs";
import {
  __name,
  __toESM,
  init_esm
} from "../../../../../chunk-KUOAKOUY.mjs";

// src/trigger/extractFrameTask.ts
init_esm();
var import_fluent_ffmpeg = __toESM(require_fluent_ffmpeg());
function resolveInstallerPath(module, binaryName) {
  const installerPath = module.default?.path ?? module.path;
  if (!installerPath) {
    throw new Error(`Unable to resolve ${binaryName} binary path from installer package`);
  }
  return installerPath;
}
__name(resolveInstallerPath, "resolveInstallerPath");
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
      const ffmpegInstaller = await import("../../../../../ffmpeg-O6VO4Q7J.mjs");
      const ffprobeInstaller = await import("../../../../../ffprobe-3I2JDTBA.mjs");
      const ffmpegPath = resolveInstallerPath(
        ffmpegInstaller,
        "ffmpeg"
      );
      const ffprobePath = resolveInstallerPath(
        ffprobeInstaller,
        "ffprobe"
      );
      import_fluent_ffmpeg.default.setFfmpegPath(ffmpegPath);
      import_fluent_ffmpeg.default.setFfprobePath(ffprobePath);
      console.log("ffmpeg path", ffmpegPath);
      console.log("ffprobe path", ffprobePath);
      const { runExtractFrame } = await import("../../../../../extractFrame-PJETEISQ.mjs");
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
