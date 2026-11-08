import assert from 'node:assert/strict'
import { afterEach, mock, test } from 'node:test'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { generateSuggestions, handleTailoring } from '../server/tailoring.ts'
import { parseTailoringRequest, parseTailoringResult } from '../src/tailoring.ts'

const request = {
  jobDescription: 'Seeking a frontend intern to build accessible applications with React and TypeScript.',
  blocks: [{ id: 'project-one', type: 'project' as const, title: 'Student portal', subtitle: 'React', bullets: ['Built an accessible course planner.'] }],
  selectedIds: ['project-one'],
}
const suggestion = { summary: 'The portal demonstrates React experience.', recommendations: [{ blockId: 'project-one', reason: 'Relevant React project.' }] }
const success = () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(suggestion) }] }] })
afterEach(() => mock.restoreAll())

async function invoke({ body = request as unknown, raw = false, method = 'POST', headers = {} as Record<string, string>, apiKey = 'test-key' } = {}) {
  const req = Object.assign(Readable.from(raw ? [body as string] : []), {
    method, headers: { 'content-type': 'application/json', ...headers }, ...(raw ? {} : { body }),
  }) as unknown as IncomingMessage & { body?: unknown }
  let output = ''
  const responseHeaders: Record<string, string> = {}
  const res = {
    statusCode: 200,
    setHeader(name: string, value: string) { responseHeaders[name] = value },
    end(value: string) { output = value },
  }
  await handleTailoring(req, res as unknown as ServerResponse, { apiKey })
  return { status: res.statusCode, body: JSON.parse(output), headers: responseHeaders }
}

test('request parsing excludes unrelated fields and rejects duplicates or oversized inputs', () => {
  assert.deepEqual(parseTailoringRequest({ ...request, profile: { email: 'private@example.com' } }), request)
  assert.throws(() => parseTailoringRequest({ ...request, jobDescription: '   ' }))
  assert.throws(() => parseTailoringRequest({ ...request, jobDescription: 'x'.repeat(12001) }))
  assert.throws(() => parseTailoringRequest({ ...request, blocks: [...request.blocks, ...request.blocks] }))
  assert.throws(() => parseTailoringRequest({ ...request, selectedIds: ['invented'] }))
})

test('output validation rejects unknown IDs, repeated IDs, and malformed notes', () => {
  assert.deepEqual(parseTailoringResult(suggestion, request.blocks), suggestion)
  assert.throws(() => parseTailoringResult({ ...suggestion, recommendations: [{ blockId: 'invented', reason: 'Fake.' }] }, request.blocks))
  assert.throws(() => parseTailoringResult({ ...suggestion, recommendations: [...suggestion.recommendations, ...suggestion.recommendations] }, request.blocks))
  assert.throws(() => parseTailoringResult({ ...suggestion, summary: '' }, request.blocks))
})

test('Responses API request uses server credentials, constrained IDs, and no stored response', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async (_url: unknown, options?: RequestInit) => {
    assert.equal(_url, 'https://api.openai.com/v1/responses')
    assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer test-key')
    const body = JSON.parse(options?.body as string)
    assert.equal(body.model, 'gpt-4.1-mini')
    assert.equal(body.store, false)
    assert.equal(body.text.format.strict, true)
    assert.deepEqual(body.text.format.schema.properties.recommendations.items.properties.blockId.enum, ['project-one'])
    return success()
  })
  const result = await invoke()
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, suggestion)
  assert.equal(result.headers['Cache-Control'], 'no-store')
})

test('same handler accepts the local raw stream and Vercel parsed or string bodies', async () => {
  mock.method(globalThis, 'fetch', async () => success())
  assert.equal((await invoke({ raw: true, body: JSON.stringify(request) })).status, 200)
  assert.equal((await invoke({ body: JSON.stringify(request) })).status, 200)
})

test('invalid requests fail before calling OpenAI', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new Error('Must not call provider') })
  assert.equal((await invoke({ method: 'GET' })).status, 405)
  assert.equal((await invoke({ headers: { 'content-type': 'text/plain' } })).status, 415)
  assert.equal((await invoke({ headers: { 'sec-fetch-site': 'cross-site' } })).status, 403)
  assert.equal((await invoke({ raw: true, body: '{' })).status, 400)
  assert.equal((await invoke({ body: { ...request, selectedIds: ['fake'] } })).status, 400)
  assert.equal((await invoke({ raw: true, body: 'x'.repeat(256001) })).status, 413)
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('missing configuration gives a useful error without exposing a key', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => success())
  const result = await invoke({ apiKey: '' })
  assert.equal(result.status, 503)
  assert.match(result.body.error, /not configured/)
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('provider errors are translated without leaking response content', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ secret: 'provider-internal-detail' }, { status: 401 }))
  const result = await invoke()
  assert.equal(result.status, 503)
  assert.doesNotMatch(JSON.stringify(result.body), /provider-internal-detail|test-key/)
})

test('provider rate limits and timeouts are recoverable errors', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('', { status: 429 }))
  assert.equal((await invoke()).status, 429)
  fetchMock.mock.mockImplementation(async () => { throw new DOMException('timed out', 'TimeoutError') })
  assert.equal((await invoke()).status, 504)
})

test('refusals, incomplete output, malformed JSON, or invented blocks are never applied', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal' }] }] }))
  assert.equal((await invoke()).status, 422)
  fetchMock.mock.mockImplementation(async () => Response.json({ status: 'incomplete' }))
  assert.equal((await invoke()).status, 502)
  fetchMock.mock.mockImplementation(async () => new Response('not JSON'))
  assert.equal((await invoke()).status, 502)
  fetchMock.mock.mockImplementation(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{' }] }] }))
  assert.equal((await invoke()).status, 502)
  fetchMock.mock.mockImplementation(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ ...suggestion, recommendations: [{ blockId: 'fake', reason: 'invented' }] }) }] }] }))
  assert.equal((await invoke()).status, 502)
})

test('an empty relevant selection is valid review feedback', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ summary: 'No matching experience.', recommendations: [] }) }] }] }))
  assert.deepEqual(await generateSuggestions(request, { apiKey: 'test-key' }), { summary: 'No matching experience.', recommendations: [] })
})
