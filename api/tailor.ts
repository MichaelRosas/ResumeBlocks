import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleTailoring } from '../server/tailoring.js'

export default function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  return handleTailoring(req, res, { apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL })
}
