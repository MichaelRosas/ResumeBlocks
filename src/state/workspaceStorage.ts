import { blockLabels } from '../types'
import type { ResumeBlock, ResumePreset, ResumeProfile } from '../types'
import { createInitialState, markPresetChanges } from './builder'
import type { BuilderState } from './builder'
import { copyBlock } from './resumeSnapshots'

export const WORKSPACE_STORAGE_KEY = 'resumeblocks.workspace'
const WORKSPACE_VERSION = 2

export type LoadIssue = 'unreadable' | 'unavailable'
export type SaveStatus = 'saving' | 'saved' | 'error' | 'blocked'

interface LoadedWorkspace {
  state: BuilderState
  issue: LoadIssue | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isBlock(value: unknown): value is ResumeBlock {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && typeof value.type === 'string'
    && Object.hasOwn(blockLabels, value.type)
    && isNonEmptyString(value.title)
    && typeof value.subtitle === 'string'
    && (value.date === undefined || typeof value.date === 'string')
    && isStringArray(value.bullets)
}

function isProfile(value: unknown): value is ResumeProfile {
  return isRecord(value)
    && typeof value.name === 'string'
    && typeof value.headline === 'string'
    && typeof value.email === 'string'
    && typeof value.location === 'string'
    && typeof value.website === 'string'
}

interface LegacyPreset {
  id: string
  name: string
  description: string
  blockIds: string[]
}

type CoreState = Pick<BuilderState, 'blocks' | 'profile' | 'selectedIds' | 'compact' | 'modified'> & Record<string, unknown>
type LegacyState = CoreState & { presets: LegacyPreset[]; presetId: string }

function isLegacyPreset(value: unknown): value is LegacyPreset {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isNonEmptyString(value.name)
    && typeof value.description === 'string'
    && isStringArray(value.blockIds)
}

function isCoreState(value: unknown): value is CoreState {
  return isRecord(value)
    && Array.isArray(value.blocks) && value.blocks.every(isBlock)
    && isProfile(value.profile) && isStringArray(value.selectedIds)
    && typeof value.compact === 'boolean' && typeof value.modified === 'boolean'
    && uniqueBlockIds(value.blocks)
    && new Set(value.selectedIds).size === value.selectedIds.length
}

function uniqueBlockIds(blocks: ResumeBlock[]): boolean {
  return new Set(blocks.map((block) => block.id)).size === blocks.length
}

function isPreset(value: unknown): value is ResumePreset {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.name)
    && typeof value.description === 'string' && isProfile(value.profile)
    && typeof value.compact === 'boolean'
    && Array.isArray(value.blocks) && value.blocks.every(isBlock) && uniqueBlockIds(value.blocks)
}

function isWorkspace(value: unknown): value is BuilderState {
  if (!isCoreState(value)
    || !Array.isArray(value.resumeBlocks) || !value.resumeBlocks.every(isBlock) || !uniqueBlockIds(value.resumeBlocks)
    || !Array.isArray(value.presets) || !value.presets.every(isPreset)) return false
  const presetIds = new Set(value.presets.map((preset) => preset.id))
  const resumeIds = new Set(value.resumeBlocks.map((block) => block.id))
  return presetIds.size === value.presets.length
    && (value.presetId === null || (isNonEmptyString(value.presetId) && presetIds.has(value.presetId)))
    && resumeIds.size === value.selectedIds.length
    && value.selectedIds.every((id) => resumeIds.has(id))
}

function isLegacyWorkspace(value: unknown): value is LegacyState {
  if (!isCoreState(value)
    || !Array.isArray(value.presets) || !value.presets.length || !value.presets.every(isLegacyPreset)
    || !isNonEmptyString(value.presetId)) return false

  const blockIds = new Set(value.blocks.map((block) => block.id))
  const presetIds = new Set(value.presets.map((preset) => preset.id))
  const validReferences = (ids: string[]) => new Set(ids).size === ids.length
    && ids.every((id) => blockIds.has(id))

  return presetIds.size === value.presets.length
    && presetIds.has(value.presetId)
    && validReferences(value.selectedIds)
    && value.presets.every((preset) => validReferences(preset.blockIds))
}

function migrateWorkspace(legacy: LegacyState): BuilderState {
  const copySelection = (ids: string[]) => ids.flatMap((id) => {
    const block = legacy.blocks.find((item) => item.id === id)
    return block ? [copyBlock(block)] : []
  })
  return markPresetChanges({
    blocks: legacy.blocks.map(copyBlock),
    resumeBlocks: copySelection(legacy.selectedIds),
    selectedIds: [...legacy.selectedIds],
    profile: { ...legacy.profile },
    compact: legacy.compact,
    presetId: legacy.presetId,
    modified: legacy.modified,
    presets: legacy.presets.map(({ blockIds, ...preset }) => ({
      ...preset, blocks: copySelection(blockIds), profile: { ...legacy.profile }, compact: false,
    })),
  })
}

export function loadWorkspace(): LoadedWorkspace {
  let raw: string | null
  try {
    // Accessing localStorage itself can throw when the browser blocks storage.
    raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY)
  } catch {
    return { state: createInitialState(), issue: 'unavailable' }
  }
  if (raw === null) return { state: createInitialState(), issue: null }

  try {
    const saved: unknown = JSON.parse(raw)
    if (isRecord(saved) && saved.version === WORKSPACE_VERSION && isWorkspace(saved.state)) {
      return { state: markPresetChanges(saved.state), issue: null }
    }
    if (isRecord(saved) && saved.version === 1 && isLegacyWorkspace(saved.state)) {
      return { state: migrateWorkspace(saved.state), issue: null }
    }
  } catch {
    // Preserve the original saved value. Recovery requires an explicit choice.
  }
  return { state: createInitialState(), issue: 'unreadable' }
}

export function saveWorkspace(state: BuilderState): boolean {
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ version: WORKSPACE_VERSION, state }))
    return true
  } catch {
    return false
  }
}
