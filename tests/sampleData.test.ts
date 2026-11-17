import assert from 'node:assert/strict'
import { test } from 'node:test'
import { builderReducer, createInitialState } from '../src/state/builder.js'
import { decodeWorkspace } from '../src/state/workspaceStorage.js'
import { standardFormatting } from '../src/formatting.js'

test('sample loading populates an empty workspace with independent editable snapshots', () => {
  const initial = createInitialState()
  const loaded = builderReducer(initial, { type: 'loadSampleData' })
  assert.equal(initial.blocks.length, 0)
  assert.equal(loaded.blocks.length, 6)
  assert.equal(loaded.presets.length, 2)
  assert.equal(loaded.resumeBlocks.length, 5)
  assert.equal(loaded.modified, false)
  assert.equal(loaded.presetId, 'sample-general')
  assert.notDeepEqual(loaded.presets[0].formatting, loaded.presets[1].formatting)
  assert.deepEqual(decodeWorkspace(JSON.stringify({ version: 3, state: loaded })).state, loaded)
  assert.notEqual(loaded.resumeBlocks[0].bullets, loaded.blocks[0].bullets)
  assert.notEqual(loaded.resumeBlocks[0].bullets, loaded.presets[0].blocks[0].bullets)
  const updated = builderReducer(loaded, { type: 'saveBlock', block: { ...loaded.blocks[0], title: 'Edited sample' }, includeInResume: true })
  assert.notEqual(updated.presets[0].blocks[0].title, 'Edited sample')
  assert.equal(builderReducer(loaded, { type: 'loadSampleData' }), loaded)
})

test('adding samples preserves existing draft content, formatting, and saved presets', () => {
  let state = createInitialState()
  state = builderReducer(state, { type: 'saveBlock', block: { id: 'my-project', type: 'project', title: 'My project', subtitle: '', bullets: ['My own work.'] }, includeInResume: true })
  state = builderReducer(state, { type: 'createPreset', id: 'my-preset', name: 'Sample general resume', description: '' })
  state = builderReducer(state, { type: 'saveProfile', profile: { name: 'My name', headline: '', email: '', location: '', website: '' } })
  state = builderReducer(state, { type: 'setFormatting', formatting: { ...standardFormatting, fontSize: 12, pageMargin: 0.75 } })
  const loaded = builderReducer(state, { type: 'loadSampleData' })
  assert.equal(loaded.blocks.length, 7)
  assert.deepEqual(loaded.blocks[0], state.blocks[0])
  assert.deepEqual(loaded.resumeBlocks, state.resumeBlocks)
  assert.deepEqual(loaded.profile, state.profile)
  assert.deepEqual(loaded.selectedIds, state.selectedIds)
  assert.deepEqual(loaded.formatting, state.formatting)
  assert.deepEqual(loaded.presets[0], state.presets[0])
  assert.equal(loaded.presetId, state.presetId)
  assert.equal(loaded.modified, state.modified)
  assert.equal(loaded.presets[1].name, 'Sample general resume (2)')
})

test('loading samples into an empty draft preserves formatting already chosen', () => {
  let state = createInitialState()
  state = builderReducer(state, { type: 'setFormatting', formatting: { ...standardFormatting, font: 'arial', fontSize: 12 } })
  const loaded = builderReducer(state, { type: 'loadSampleData' })
  assert.deepEqual(loaded.formatting, state.formatting)
  assert.equal(loaded.modified, true)
})
