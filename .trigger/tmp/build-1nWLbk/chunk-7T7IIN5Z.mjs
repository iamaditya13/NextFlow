import {
  __name,
  init_esm
} from "./chunk-KUOAKOUY.mjs";

// src/trigger/utils/uploadToTransloadit.ts
init_esm();
async function uploadToTransloadit(filePath, mimeType, templateId) {
  const startedAt = Date.now();
  const path = await import("path");
  const fs = await import("fs");
  const authKey = process.env.TRANSLOADIT_KEY || process.env.NEXT_PUBLIC_TRANSLOADIT_KEY;
  const authSecret = process.env.TRANSLOADIT_SECRET;
  const template = templateId || process.env.TRANSLOADIT_TEMPLATE_ID_IMAGE;
  if (!authKey) {
    throw new Error("Missing Transloadit key: set TRANSLOADIT_KEY (or NEXT_PUBLIC_TRANSLOADIT_KEY)");
  }
  if (!authSecret) {
    throw new Error("Missing TRANSLOADIT_SECRET");
  }
  if (!template) {
    throw new Error("Missing Transloadit template id: set TRANSLOADIT_TEMPLATE_ID_IMAGE");
  }
  const expires = new Date(Date.now() + 36e5).toISOString().replace("T", " ").replace(/\.\d{3}Z/, "+00:00");
  const params = JSON.stringify({
    auth: { key: authKey, expires },
    template_id: template
  });
  const crypto = await import("crypto");
  const signature = crypto.createHmac("sha384", authSecret).update(Buffer.from(params, "utf-8")).digest("hex");
  const fileBuffer = await fs.promises.readFile(filePath);
  const fileName = path.basename(filePath);
  const form = new FormData();
  form.append("params", params);
  form.append("signature", `sha384:${signature}`);
  form.append("file", new Blob([fileBuffer], { type: mimeType }), fileName);
  const response = await fetch("https://api2.transloadit.com/assemblies", {
    method: "POST",
    body: form
  });
  const result = await response.json();
  const resultObject = result;
  if (!response.ok) {
    throw new Error(
      `Transloadit assembly creation failed (${response.status}): ${typeof resultObject.error === "string" ? resultObject.error : JSON.stringify(resultObject)}`
    );
  }
  if (resultObject.error) {
    throw new Error(`Transloadit error: ${String(resultObject.error)}`);
  }
  let assembly = resultObject;
  let attempts = 0;
  const pollIntervalMs = 500;
  const maxAttempts = 120;
  const assemblyUrl = assembly.assembly_ssl_url;
  if (typeof assemblyUrl !== "string" || !assemblyUrl) {
    throw new Error("Transloadit did not return assembly_ssl_url");
  }
  while (assembly.ok !== "ASSEMBLY_COMPLETED" && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));
    attempts++;
    const poll = await fetch(assemblyUrl);
    assembly = await poll.json();
    if (assembly.error) {
      throw new Error(`Assembly failed: ${String(assembly.error)}`);
    }
  }
  if (assembly.ok !== "ASSEMBLY_COMPLETED") {
    throw new Error("Transloadit assembly timed out");
  }
  const results = assembly.results;
  const firstStep = (results ? Object.values(results)[0] : []) || [];
  if (!firstStep || firstStep.length === 0) {
    const uploads = Object.values(assembly.uploads || {}).flat();
    if (uploads.length === 0) {
      throw new Error("No output files from Transloadit");
    }
    const uploadEntry = uploads[0];
    if (!uploadEntry.ssl_url) {
      throw new Error("Transloadit upload response missing ssl_url");
    }
    console.log("[transloadit] upload complete", {
      filePath,
      mimeType,
      durationMs: Date.now() - startedAt
    });
    return uploadEntry.ssl_url;
  }
  const firstStepEntry = firstStep[0];
  if (!firstStepEntry.ssl_url) {
    throw new Error("Transloadit step output missing ssl_url");
  }
  console.log("[transloadit] upload complete", {
    filePath,
    mimeType,
    durationMs: Date.now() - startedAt
  });
  return firstStepEntry.ssl_url;
}
__name(uploadToTransloadit, "uploadToTransloadit");

export {
  uploadToTransloadit
};
//# sourceMappingURL=chunk-7T7IIN5Z.mjs.map
