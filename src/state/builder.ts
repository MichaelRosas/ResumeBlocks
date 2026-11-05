import { sampleBlocks, samplePresets, sampleProfile } from '../data/sampleResume'
import type { ResumeBlock, ResumePreset, ResumeProfile } from '../types'

export interface BuilderState {
  blocks: ResumeBlock[]
  profile: ResumeProfile
  presets: ResumePreset[]
  presetId: string
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

export function createInitialState(): BuilderState {
  return {
    blocks: sampleBlocks.map((block) => ({ ...block, bullets: [...block.bullets] })),
    profile: { ...sampleProfile },
    presets: samplePresets.map((preset) => ({ ...preset, blockIds: [...preset.blockIds] })),
    presetId: samplePresets[0].id,
    selectedIds: [...samplePresets[0].blockIds],
    compact: false,
    modified: false,
  }
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'selectPreset': {
      const preset = state.presets.find((item) => item.id === action.id)
      if (!preset) return state
      return { ...state, presetId: preset.id, selectedIds: [...preset.blockIds] }
    }
    case 'toggleBlock': {
      if (!state.blocks.some((block) => block.id === action.id)) return state
      const included = state.selectedIds.includes(action.id)
      return {
        ...state,
        modified: true,
        selectedIds: included
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      }
    }
    case 'saveBlock': {
      const exists = state.blocks.some((block) => block.id === action.block.id)
      const included = state.selectedIds.includes(action.block.id)
      return {
        ...state,
        modified: true,
        blocks: exists
          ? state.blocks.map((block) => block.id === action.block.id ? action.block : block)
          : [...state.blocks, action.block],
        selectedIds: action.includeInResume
          ? included ? state.selectedIds : [...state.selectedIds, action.block.id]
          : state.selectedIds.filter((id) => id !== action.block.id),
      }
    }
    case 'deleteBlock':
      return {
        ...state,
        modified: true,
        blocks: state.blocks.filter((block) => block.id !== action.id),
        selectedIds: state.selectedIds.filter((id) => id !== action.id),
        // A deleted block must not reappear when another example is loaded.
        presets: state.presets.map((preset) => ({
          ...preset,
          blockIds: preset.blockIds.filter((id) => id !== action.id),
        })),
      }
    case 'saveProfile':
      return { ...state, profile: action.profile, modified: true }
    case 'setCompact':
      return { ...state, compact: action.compact }
  }
}
