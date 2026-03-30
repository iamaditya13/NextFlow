import {
  defineConfig
} from "../../../chunk-HM4JK3DY.mjs";
import "../../../chunk-WC7F3RM6.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-KUOAKOUY.mjs";

// trigger.config.ts
init_esm();

// src/lib/env/getTriggerEnv.ts
init_esm();
function getRequiredEnvValue(key, options) {
  const value = process.env[key];
  if (value) {
    return value;
  }
  if (options?.allowMissing) {
    return "";
  }
  throw new Error(`Missing ${key}`);
}
__name(getRequiredEnvValue, "getRequiredEnvValue");
function getTriggerProjectId(options) {
  return getRequiredEnvValue("TRIGGER_PROJECT_ID", options);
}
__name(getTriggerProjectId, "getTriggerProjectId");

// trigger.config.ts
var projectId = getTriggerProjectId({ allowMissing: true }) || "__MISSING_TRIGGER_PROJECT_ID__";
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
