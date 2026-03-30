import {
  defineConfig
} from "../../../chunk-HM4JK3DY.mjs";
import "../../../chunk-WC7F3RM6.mjs";
import {
  init_esm
} from "../../../chunk-KUOAKOUY.mjs";

// trigger.config.ts
init_esm();
var projectId = process.env.TRIGGER_PROJECT_ID;
if (!projectId) {
  throw new Error(
    "Missing TRIGGER_PROJECT_ID. Set it in .env.local and in production before starting Trigger.dev workers."
  );
}
var trigger_config_default = defineConfig({
  project: projectId,
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["./src/trigger"],
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
