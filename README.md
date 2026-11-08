# ResumeBlocks

## Run locally

Requires Node.js 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```bash
npm run build      # TypeScript checks and production build
npm run preview    # Serve the production build locally
npm test           # Validate tailoring requests and AI responses
```

## AI tailoring

Copy `.env.example` to `.env.local`, set `OPENAI_API_KEY`, and restart `npm run dev`.
The key stays on the server. Never use a `VITE_` variable for it or commit `.env.local`.
`OPENAI_MODEL` defaults to `gpt-4.1-mini`.

Open **Tailor to a job**, paste a job description, and generate suggestions. Review
the checked blocks before applying them to your draft. The AI selects and orders
existing blocks; it does not rewrite content or update saved presets. The job
description and available blocks are sent to OpenAI; contact details are excluded.

For Vercel, import this repository using the Vite preset and add `OPENAI_API_KEY`
in the project's environment variables before deploying. The `/api/tailor`
function runs on Vercel; `npm run dev` provides the same endpoint locally.
`npm run preview` serves only the built frontend and does not run the API.
