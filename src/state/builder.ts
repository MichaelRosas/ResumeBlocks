import type { ResumeBlock, ResumePreset, ResumeProfile } from '../types'
import { captureResume, copyBlock, hasPresetChanges, isPresetNameAvailable } from './resumeSnapshots'

export interface BuilderState {
  blocks: ResumeBlock[]
  resumeBlocks: ResumeBlock[]
  profile: ResumeProfile
  presets: ResumePreset[]
  presetId: string | null
  selectedIds: string[]
  compact: boolean
  modified: boolean
}

export type BuilderAction =
  | { type: 'toggleBlock'; id: string }
  | { type: 'selectPreset'; id: string }
  | { type: 'saveBlock'; block: ResumeBlock; includeInResume: boolean }
  | { type: 'deleteBlock'; id: string }
  | { type: 'saveProfile'; profile: ResumeProfile }
  | { type: 'setCompact'; compact: boolean }
  | { type: 'placeBlock'; id: string; index: number }
  | { type: 'removeBlock'; id: string }
  | { type: 'createPreset'; id: string; name: string; description: string }
  | { type: 'updatePreset' }
  | { type: 'renamePreset'; id: string; name: string; description: string }
  | { type: 'deletePreset'; id: string }
  | { type: 'applyTailoring'; ids: string[] }

export function markPresetChanges(state: BuilderState): BuilderState {
  return { ...state, modified: hasPresetChanges(captureResume(state), state.presets.find((preset) => preset.id === state.presetId)) }
}

export function createInitialState(): BuilderState {
  return {
    blocks: [],
    resumeBlocks: [],
    profile: { name: '', headline: '', email: '', location: '', website: '' },
    presets: [],
    presetId: null,
    selectedIds: [],
    compact: false,
    modified: false,
  }
}

function removeFromResume(state: BuilderState, id: string): BuilderState {
  if (!state.selectedIds.includes(id)) return state
  const block = state.resumeBlocks.find((item) => item.id === id)
  return markPresetChanges({
    ...state,
    // A block loaded from a snapshot might no longer exist in the library.
    blocks: block && !state.blocks.some((item) => item.id === id) ? [...state.blocks, copyBlock(block)] : state.blocks,
    resumeBlocks: state.resumeBlocks.filter((item) => item.id !== id),
    selectedIds: state.selectedIds.filter((item) => item !== id),
  })
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'applyTailoring': {
      if (!action.ids.length || new Set(action.ids).size !== action.ids.length) return state
      const selected = action.ids.flatMap((id) => {
        // Prefer the working snapshot if the library has a different version.
        const block = state.resumeBlocks.find((item) => item.id === id) ?? state.blocks.find((item) => item.id === id)
        return block ? [copyBlock(block)] : []
      })
      if (selected.length !== action.ids.length) return state
      return markPresetChanges({
        ...state,
        // Preserve blocks originating in an older preset when they leave the draft.
        blocks: [...state.blocks, ...state.resumeBlocks.filter((block) => !action.ids.includes(block.id) && !state.blocks.some((item) => item.id === block.id)).map(copyBlock)],
        resumeBlocks: selected,
        selectedIds: [...action.ids],
      })
    }
    case 'selectPreset': {
      const preset = state.presets.find((item) => item.id === action.id)
      if (!preset) return state
      return {
        ...state,
        presetId: preset.id,
        selectedIds: preset.blocks.map((block) => block.id),
        resumeBlocks: preset.blocks.map(copyBlock),
        profile: { ...preset.profile },
        compact: preset.compact,
        modified: false,
      }
    }
    case 'toggleBlock': {
      if (state.selectedIds.includes(action.id)) return removeFromResume(state, action.id)
      const block = state.blocks.find((item) => item.id === action.id)
      if (!block) return state
      return markPresetChanges({
        ...state,
        selectedIds: [...state.selectedIds, action.id],
        resumeBlocks: [...state.resumeBlocks, copyBlock(block)],
      })
    }
    case 'removeBlock':
      return removeFromResume(state, action.id)
    case 'placeBlock': {
      const block = state.resumeBlocks.find((item) => item.id === action.id) ?? state.blocks.find((item) => item.id === action.id)
      if (!block || !Number.isInteger(action.index)) return state
      const remaining = state.selectedIds.filter((id) => id !== action.id)
      const peers = remaining.filter((id) => state.resumeBlocks.find((item) => item.id === id)?.type === block.type)
      const index = Math.max(0, Math.min(action.index, peers.length))
      const beforeId = peers[index]
      const insertionIndex = beforeId ? remaining.indexOf(beforeId)
        : peers.length ? remaining.indexOf(peers[peers.length - 1]) + 1 : remaining.length
      const selectedIds = [...remaining]
      selectedIds.splice(insertionIndex, 0, action.id)
      if (selectedIds.length === state.selectedIds.length && selectedIds.every((id, position) => state.selectedIds[position] === id)) return state
      return markPresetChanges({
        ...state,
        selectedIds,
        resumeBlocks: state.resumeBlocks.some((item) => item.id === action.id) ? state.resumeBlocks : [...state.resumeBlocks, copyBlock(block)],
      })
    }
    case 'saveBlock': {
      const exists = state.blocks.some((block) => block.id === action.block.id)
      const included = state.selectedIds.includes(action.block.id)
      return markPresetChanges({
        ...state,
        blocks: exists
          ? state.blocks.map((block) => block.id === action.block.id ? copyBlock(action.block) : block)
          : [...state.blocks, copyBlock(action.block)],
        resumeBlocks: action.includeInResume
          ? included
            ? state.resumeBlocks.map((block) => block.id === action.block.id ? copyBlock(action.block) : block)
            : [...state.resumeBlocks, copyBlock(action.block)]
          : state.resumeBlocks.filter((block) => block.id !== action.block.id),
        selectedIds: action.includeInResume
          ? included ? state.selectedIds : [...state.selectedIds, action.block.id]
          : state.selectedIds.filter((id) => id !== action.block.id),
      })
    }
    case 'deleteBlock':
      return markPresetChanges({
        ...state,
        blocks: state.blocks.filter((block) => block.id !== action.id),
        resumeBlocks: state.resumeBlocks.filter((block) => block.id !== action.id),
        selectedIds: state.selectedIds.filter((id) => id !== action.id),
      })
    case 'saveProfile':
      return markPresetChanges({ ...state, profile: { ...action.profile } })
    case 'setCompact':
      return markPresetChanges({ ...state, compact: action.compact })
    case 'createPreset': {
      if (state.presets.some((preset) => preset.id === action.id) || !isPresetNameAvailable(state.presets, action.name)) return state
      const preset: ResumePreset = { id: action.id, name: action.name.trim(), description: action.description.trim(), ...captureResume(state) }
      return { ...state, presets: [...state.presets, preset], presetId: preset.id, modified: false }
    }
    case 'updatePreset': {
      if (!state.presets.some((preset) => preset.id === state.presetId)) return state
      const snapshot = captureResume(state)
      return { ...state, presets: state.presets.map((preset) => preset.id === state.presetId ? { ...preset, ...snapshot } : preset), modified: false }
    }
    case 'renamePreset': {
      if (!isPresetNameAvailable(state.presets, action.name, action.id)) return state
      return { ...state, presets: state.presets.map((preset) => preset.id === action.id ? { ...preset, name: action.name.trim(), description: action.description.trim() } : preset) }
    }
    case 'deletePreset': {
      const presets = state.presets.filter((preset) => preset.id !== action.id)
      return markPresetChanges({ ...state, presets, presetId: state.presetId === action.id ? null : state.presetId })
    }
  }
}
