import assert from 'node:assert/strict'
import { test } from 'node:test'
import { builderReducer, createInitialState } from '../src/state/builder.js'
import { decodeWorkspace } from '../src/state/workspaceStorage.js'
import { parseTailoringRequest } from '../src/tailoring.js'
import { getBlockContentFormat } from '../src/types.js'
import type { ResumeBlock } from '../src/types.js'

const project: ResumeBlock = { id: 'project', type: 'project', title: 'Course planner', subtitle: 'React', bullets: ['First paragraph.\nSecond line.', 'Second paragraph.'] }

function populatedState() {
  const state = builderReducer(createInitialState(), { type: 'saveBlock', block: project, includeInResume: true })
  return builderReducer(state, { type: 'createPreset', id: 'bulleted', name: 'Bulleted', description: '' })
}

test('changing only a block content format marks the draft and keeps snapshots independent', () => {
  let state = populatedState()
  state = builderReducer(state, { type: 'saveBlock', block: { ...project, contentFormat: 'paragraphs' }, includeInResume: true })
  assert.equal(state.modified, true)
  assert.equal(getBlockContentFormat(state.presets[0].blocks[0]), 'bullets')
  assert.equal(getBlockContentFormat(state.resumeBlocks[0]), 'paragraphs')
  assert.deepEqual(state.resumeBlocks[0].bullets, project.bullets)
  state = builderReducer(state, { type: 'createPreset', id: 'plain', name: 'Plain text', description: '' })
  state = builderReducer(state, { type: 'selectPreset', id: 'bulleted' })
  assert.equal(getBlockContentFormat(state.resumeBlocks[0]), 'bullets')
  state = builderReducer(state, { type: 'selectPreset', id: 'plain' })
  assert.equal(getBlockContentFormat(state.resumeBlocks[0]), 'paragraphs')
  assert.deepEqual(decodeWorkspace(JSON.stringify({ version: 3, state })).state, state)
})

test('older blocks keep their defaults and explicitly saving the same format is not a draft change', () => {
  let state = populatedState()
  assert.equal(getBlockContentFormat(project), 'bullets')
  assert.equal(getBlockContentFormat({ type: 'skills' }), 'paragraphs')
  state = builderReducer(state, { type: 'saveBlock', block: { ...project, contentFormat: 'bullets' }, includeInResume: true })
  assert.equal(state.modified, false)
  assert.equal(decodeWorkspace(JSON.stringify({ version: 3, state })).issue, null)
})

test('tailoring preserves paragraph format and original text when applying selected blocks', () => {
  const block: ResumeBlock = { ...project, contentFormat: 'paragraphs' }
  const request = parseTailoringRequest({ jobDescription: 'Build accessible React applications and help students plan their coursework.', blocks: [block], selectedIds: [block.id] })
  assert.deepEqual(request.blocks[0], block)
  let state = builderReducer(createInitialState(), { type: 'saveBlock', block, includeInResume: false })
  state = builderReducer(state, { type: 'applyTailoring', ids: [block.id] })
  assert.deepEqual(state.resumeBlocks[0], block)
})

test('invalid stored or requested formats are rejected instead of silently changing rendering', () => {
  const state = populatedState()
  const invalid = { ...project, contentFormat: 'unknown' }
  assert.equal(decodeWorkspace(JSON.stringify({ version: 3, state: { ...state, blocks: [invalid] } })).issue, 'unreadable')
  assert.equal(decodeWorkspace(JSON.stringify({ version: 3, state: { ...state, presets: [{ ...state.presets[0], blocks: [invalid] }] } })).issue, 'unreadable')
  assert.throws(() => parseTailoringRequest({ jobDescription: 'Build accessible React applications and help students plan their coursework.', blocks: [invalid], selectedIds: [] }))
})
