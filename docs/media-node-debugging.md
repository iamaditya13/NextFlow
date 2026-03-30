# Media Node Debugging Guide

## 1) Required environment variables

Set these in `.env.local`:

- `TRIGGER_SECRET_KEY`
- `TRIGGER_PROJECT_ID`
- `TRIGGER_API_URL` (default: `https://api.trigger.dev`)
- `TRANSLOADIT_SECRET`
- `TRANSLOADIT_TEMPLATE_ID_IMAGE`
- `TRANSLOADIT_KEY` (or `NEXT_PUBLIC_TRANSLOADIT_KEY`)
- `GOOGLE_AI_API_KEY` (required only if validating the Gemini node)

Optional local-debug vars:

- `MEDIA_NODE_LOCAL_FALLBACK=1` to run local ffmpeg processing when Trigger worker is unavailable.
- `TEST_IMAGE_URL` / `TEST_VIDEO_URL` for integration testing.

`crop-image` and `extract-frame` now use bundled binaries from `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe`, so no system `ffmpeg`/`ffprobe` installation is required on local machines, Vercel, or Trigger.dev workers.

## 2) Start local services

Run in separate terminals:

```bash
npm run dev
```

```bash
npm run trigger:dev
```

## 3) Validate crop/extract + downstream LLM

```bash
npm run test:media:nodes
```

This script:

1. Triggers `crop-image`
2. Triggers `extract-frame`
3. Optionally triggers `llm-execution` using those outputs
4. Prints run status transitions and final outputs

## 4) Production checklist (Vercel + Trigger.dev)

1. Set all env vars in Vercel and Trigger.dev worker environment.
2. Deploy Next.js app to Vercel.
3. Deploy Trigger workers:

```bash
npm run trigger:deploy
```

4. Verify worker deployment shows tasks:
   - `crop-image`
   - `extract-frame`
   - `llm-execution`
5. Execute one run and confirm logs show:
   - Route request received
   - Task queued + picked up
   - Task completed with output URL
