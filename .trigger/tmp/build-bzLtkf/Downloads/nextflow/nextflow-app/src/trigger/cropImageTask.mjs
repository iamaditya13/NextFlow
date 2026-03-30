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

// src/trigger/cropImageTask.ts
init_esm();
var import_fluent_ffmpeg = __toESM(require_fluent_ffmpeg());
function resolveInstallerPath(module) {
  const installerPath = module.default?.path ?? module.path;
  if (!installerPath) {
    throw new Error("Unable to resolve ffmpeg binary path from installer package");
  }
  return installerPath;
}
__name(resolveInstallerPath, "resolveInstallerPath");
var cropImageTask = task({
  id: "crop-image",
  maxDuration: 300,
  run: /* @__PURE__ */ __name(async (payload) => {
    const {
      imageUrl,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      runId,
      nodeId
    } = payload;
    const startTime = Date.now();
    const taskPrefix = `[trigger-task:crop-image] [runId:${runId}] [nodeId:${nodeId}]`;
    console.log(`${taskPrefix} payload received`, {
      imageUrl,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent
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
      const ffmpegPath = resolveInstallerPath(
        ffmpegInstaller
      );
      import_fluent_ffmpeg.default.setFfmpegPath(ffmpegPath);
      console.log("ffmpeg path", ffmpegPath);
      const { runCropImage } = await import("../../../../../cropImage-QLGJU3S2.mjs");
      const result = await runCropImage({
        imageUrl,
        xPercent,
        yPercent,
        widthPercent,
        heightPercent
      });
      const duration = Date.now() - startTime;
      console.log(`${taskPrefix} completed`, { durationMs: duration, outputUrl: result.url });
      if (runId !== "__standalone__") {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: "SUCCESS",
            outputs: { url: result.url },
            completedAt: /* @__PURE__ */ new Date(),
            duration
          }
        });
      }
      return { url: result.url };
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
  cropImageTask
};
//# sourceMappingURL=cropImageTask.mjs.map
