import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleTailoring } from './server/tailoring'

export default defineConfig(({ mode }) => {
  // Loaded only in this Node config, never exposed through VITE_ variables.
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), {
    name: 'local-tailoring-api',
    configureServer(server) {
      server.middlewares.use('/api/tailor', (req, res) => {
        void handleTailoring(req, res, { apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL })
      })
    },
  }] }
})
