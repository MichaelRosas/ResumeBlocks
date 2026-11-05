import { blockLabels } from '../types'
import type { ResumeBlock, ResumePreset, ResumeProfile } from '../types'
import { createInitialState } from './builder'
import type { BuilderState } from './builder'

export const WORKSPACE_STORAGE_KEY = 'resumeblocks.workspace'
const WORKSPACE_VERSION = 1

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
    && isNonEmptyString(value.name)
    && typeof value.headline === 'string'
    && typeof value.email === 'string'
    && typeof value.location === 'string'
    && typeof value.website === 'string'
}

function isPreset(value: unknown): value is ResumePreset {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isNonEmptyString(value.name)
    && typeof value.description === 'string'
    && isStringArray(value.blockIds)
}

function isWorkspace(value: unknown): value is BuilderState {
  if (!isRecord(value)
    || !Array.isArray(value.blocks) || !value.blocks.every(isBlock)
    || !isProfile(value.profile)
    || !Array.isArray(value.presets) || !value.presets.length || !value.presets.every(isPreset)
    || !isNonEmptyString(value.presetId)
    || !isStringArray(value.selectedIds)
    || typeof value.compact !== 'boolean'
    || typeof value.modified !== 'boolean') return false

  const blockIds = new Set(value.blocks.map((block) => block.id))
  const presetIds = new Set(value.presets.map((preset) => preset.id))
  const validReferences = (ids: string[]) => new Set(ids).size === ids.length
    && ids.every((id) => blockIds.has(id))

  return blockIds.size === value.blocks.length
    && presetIds.size === value.presets.length
    && presetIds.has(value.presetId)
    && validReferences(value.selectedIds)
    && value.presets.every((preset) => validReferences(preset.blockIds))
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
      return { state: saved.state, issue: null }
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
