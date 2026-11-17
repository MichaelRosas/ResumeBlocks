import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compactFormatting, standardFormatting } from '../src/formatting.js'
import { builderReducer, createInitialState } from '../src/state/builder.js'
import { decodeWorkspace } from '../src/state/workspaceStorage.js'
import type { ResumeFormatting } from '../src/types.js'

const custom: ResumeFormatting = { font: 'arial', fontSize: 11.5, lineSpacing: 1.5, sectionSpacing: 18, pageMargin: 0.75, headerAlignment: 'left' }

function populatedState() {
  let state = createInitialState()
  state = builderReducer(state, { type: 'saveBlock', block: { id: 'project', type: 'project', title: 'My project', subtitle: 'React', bullets: ['Built a course planner.'] }, includeInResume: true })
  return builderReducer(state, { type: 'createPreset', id: 'original', name: 'Original', description: '' })
}

test('formatting is captured independently, restored, and compared when updating presets', () => {
  let state = populatedState()
  const original = structuredClone(state.presets[0])
  state = builderReducer(state, { type: 'setFormatting', formatting: custom })
  assert.equal(state.modified, true)
  assert.deepEqual(state.presets[0], original)
  state = builderReducer(state, { type: 'createPreset', id: 'custom', name: 'Custom', description: '' })
  assert.deepEqual(state.presets[1].formatting, custom)
  assert.notEqual(state.presets[1].formatting, state.formatting)
  state = builderReducer(state, { type: 'setFormatting', formatting: { ...compactFormatting } })
  assert.deepEqual(state.presets[1].formatting, custom)
  state = builderReducer(state, { type: 'selectPreset', id: 'original' })
  assert.deepEqual(state.formatting, standardFormatting)
  assert.equal(state.modified, false)
  state = builderReducer(state, { type: 'selectPreset', id: 'custom' })
  assert.deepEqual(state.formatting, custom)
  state = builderReducer(state, { type: 'setFormatting', formatting: { ...standardFormatting } })
  assert.equal(state.modified, true)
  state = builderReducer(state, { type: 'updatePreset' })
  assert.equal(state.modified, false)
  assert.deepEqual(state.presets[1].formatting, standardFormatting)
})

test('invalid formatting cannot enter the workspace or saved state', () => {
  const state = populatedState()
  for (const formatting of [{ ...custom, font: 'unknown' }, { ...custom, fontSize: -1 }, { ...custom, lineSpacing: Infinity }, { ...custom, sectionSpacing: null }, { ...custom, pageMargin: 20 }, { ...custom, headerAlignment: 'right' }]) {
    assert.equal(builderReducer(state, { type: 'setFormatting', formatting: formatting as ResumeFormatting }), state)
    assert.equal(decodeWorkspace(JSON.stringify({ version: 3, state: { ...state, formatting } })).issue, 'unreadable')
  }
})

test('version 2 migration preserves independent draft and preset spacing and all content', () => {
  const state = populatedState()
  const { formatting: _formatting, ...previous } = state
  const rawState = { ...previous, compact: true, presets: state.presets.map(({ formatting: _formatting, ...preset }) => ({ ...preset, compact: false })) }
  const migrated = decodeWorkspace(JSON.stringify({ version: 2, state: rawState }))
  assert.equal(migrated.issue, null)
  assert.deepEqual(migrated.state.formatting, compactFormatting)
  assert.deepEqual(migrated.state.presets[0].formatting, standardFormatting)
  assert.deepEqual(migrated.state.blocks, state.blocks)
  assert.deepEqual(migrated.state.resumeBlocks, state.resumeBlocks)
  assert.deepEqual(migrated.state.profile, state.profile)
  assert.equal(migrated.state.modified, true)
})

test('version 1 migration keeps the working selection and creates formatted preset snapshots', () => {
  const state = populatedState()
  const legacy = {
    blocks: state.blocks, profile: state.profile, selectedIds: state.selectedIds, compact: true, modified: true,
    presetId: 'original', presets: [{ id: 'original', name: 'Original', description: '', blockIds: state.selectedIds }],
  }
  const migrated = decodeWorkspace(JSON.stringify({ version: 1, state: legacy }))
  assert.equal(migrated.issue, null)
  assert.deepEqual(migrated.state.formatting, compactFormatting)
  assert.deepEqual(migrated.state.presets[0].formatting, standardFormatting)
  assert.deepEqual(migrated.state.resumeBlocks, state.resumeBlocks)
})

test('version 3 reload preserves custom formatting and recalculates draft changes', () => {
  let state = populatedState()
  state = builderReducer(state, { type: 'setFormatting', formatting: custom })
  const loaded = decodeWorkspace(JSON.stringify({ version: 3, state }))
  assert.equal(loaded.issue, null)
  assert.deepEqual(loaded.state, state)
  assert.deepEqual(decodeWorkspace(JSON.stringify({ version: 3, state: createInitialState() })).state, createInitialState())
})

test('invalid saved preset formatting and future versions use explicit recovery', () => {
  const state = populatedState()
  const invalid = { ...state, presets: [{ ...state.presets[0], formatting: { ...custom, fontSize: 200 } }] }
  assert.equal(decodeWorkspace(JSON.stringify({ version: 3, state: invalid })).issue, 'unreadable')
  assert.equal(decodeWorkspace(JSON.stringify({ version: 4, state })).issue, 'unreadable')
  assert.equal(decodeWorkspace('{invalid').issue, 'unreadable')
})
