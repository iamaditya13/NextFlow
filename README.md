# NextFlow

Visual AI workflow builder built with Next.js, Clerk, Prisma, Trigger.dev, Gemini, and Transloadit.

NextFlow lets you create DAG-style workflows in a node editor, run them, and inspect run history. The current implementation supports text, upload, image crop, video frame extraction, and LLM nodes.

## Features

- Visual node editor with workflow persistence
- Run workflows in `FULL`, `PARTIAL`, or `SINGLE` scope
- Trigger.dev-backed node execution for async/media/LLM tasks
- Gemini-powered LLM node with model normalization and fallback handling
- Media nodes: `cropImage` (ffmpeg crop + upload output), `extractFrame` (ffmpeg frame extraction + upload output)
- Auth with Clerk (`/sign-in`, `/sign-up`, redirect to `/dashboard`)
- Workflow/run/node-result tracking in Postgres via Prisma
- Import/export workflows as JSON

## Tech Stack

- Next.js `16` (App Router)
- React `19`
- TypeScript
- Clerk (auth)
- Prisma + PostgreSQL
- Trigger.dev v4 SDK (`@trigger.dev/sdk` + `@trigger.dev/sdk/v3` APIs in codebase)
- Google Generative AI (`@google/generative-ai`)
- Transloadit (asset hosting pipeline)
- React Flow (`@xyflow/react`) for canvas editing

## Architecture At A Glance

1. UI builds/edits workflow graphs in the node editor.
2. Workflows are saved to Postgres (`Workflow` table).
3. Running a workflow creates a `WorkflowRun` and `NodeResult` records.
4. Execution engine resolves DAG order and dispatches node work (`text` / uploads inline, `llm` / `cropImage` / `extractFrame` via Trigger.dev).
5. Trigger tasks update node results, return outputs, and runs are reflected in history.

## Prerequisites

- Node.js `20+`
- npm
- PostgreSQL database
- Clerk app (publishable + secret keys)
- Trigger.dev project + secret key
- Transloadit account/templates for image/video uploads
- Gemini API key

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` values (see env section below).

4. Prepare database schema:

```bash
npx prisma generate
npx prisma db push
```

5. Start app:

```bash
npm run dev
```

6. In a second terminal, start Trigger worker:

```bash
npm run trigger:dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

Use `.env.example` as the template. Required keys:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend auth |
| `CLERK_SECRET_KEY` | Yes | Clerk server auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | Sign-in path (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | Sign-up path (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | Post sign-in redirect (`/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | Post sign-up redirect (`/dashboard`) |
| `DATABASE_URL` | Yes | Postgres connection string |
| `TRIGGER_SECRET_KEY` | Yes | Trigger.dev API auth |
| `TRIGGER_PROJECT_ID` | Yes | Trigger project ID used by runtime checks |
| `TRIGGER_API_URL` | Usually | Trigger API URL (defaults to `https://api.trigger.dev`) |
| `GOOGLE_AI_API_KEY` | Yes for LLM | Gemini API key (also supports `GEMINI_API_KEY` / `GOOGLE_API_KEY`) |
| `NEXT_PUBLIC_TRANSLOADIT_KEY` | Yes for media nodes | Transloadit public key |
| `TRANSLOADIT_SECRET` | Yes for media nodes | Transloadit signing secret |
| `TRANSLOADIT_TEMPLATE_ID_IMAGE` | Yes for media nodes | Template ID for image uploads |
| `TRANSLOADIT_TEMPLATE_ID_VIDEO` | Yes for media nodes | Template ID for video uploads |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL for callbacks/links |
| `CLERK_WEBHOOK_SECRET` | Optional | Required only for `/api/webhooks/clerk` verification |
| `MEDIA_NODE_LOCAL_FALLBACK` | Optional | Local debugging fallback behavior |
| `TEST_IMAGE_URL` | Optional | Integration test input override |
| `TEST_VIDEO_URL` | Optional | Integration test input override |

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start built app |
| `npm run lint` | Run ESLint |
| `npm run trigger:dev` | Start Trigger.dev local worker |
| `npm run trigger:deploy` | Deploy Trigger tasks/workers |
| `npm run trigger` | Alias to Trigger deploy |
| `npm run test:media:nodes` | Integration test for crop/extract (+ optional LLM) |

## Trigger.dev Notes

- Worker tasks are defined in `src/trigger/*`.
- Trigger config is in `trigger.config.ts`.
- If you use a different Trigger project, update `trigger.config.ts` (`project`) and `.env.local` (`TRIGGER_PROJECT_ID`).

Without an active worker (`npm run trigger:dev`), queued node tasks will not be picked up.

## API Surface (High Level)

- Workflows: `GET/POST /api/workflows`, `GET/PUT/PATCH/DELETE /api/workflows/:id`
- Run workflow: `POST /api/workflows/:id/run`
- Runs/history: `GET /api/executions`, `GET /api/executions/:runId`, `POST /api/executions/:runId/cancel`
- Node endpoints: `POST /api/nodes/llm`, `POST /api/nodes/crop-image`, `POST /api/nodes/extract-frame`
- Trigger run status proxy: `GET /api/trigger-runs/:runId`
- Upload signing: `POST /api/upload/signature`

## Deploy Checklist

1. Set all required env vars in deployment environment and Trigger.dev worker environment.
2. Deploy app.
3. Deploy Trigger tasks:

```bash
npm run trigger:deploy
```

4. Verify worker contains `llm-execution`, `crop-image`, and `extract-frame`.

## Troubleshooting

- `task is queued and was never picked up`: start local worker with `npm run trigger:dev` or deploy workers for the target environment.
- `Missing Trigger.dev env var(s)`: add `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_ID`.
- LLM failures: ensure a real Gemini key is set (`GOOGLE_AI_API_KEY` preferred).
- Media node failures: verify Transloadit keys/templates and that input URLs are reachable.
- Auth/webhook issues: ensure Clerk keys are set and add `CLERK_WEBHOOK_SECRET` if using webhook sync.
