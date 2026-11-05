import type { ResumeBlock, ResumePreset, ResumeProfile, ResumeSnapshot } from '../types'

export function copyBlock(block: ResumeBlock): ResumeBlock {
  return { ...block, bullets: [...block.bullets] }
}

export function captureResume(state: {
  resumeBlocks: ResumeBlock[]
  selectedIds: string[]
  profile: ResumeProfile
  compact: boolean
}): ResumeSnapshot {
  return {
    blocks: state.selectedIds.flatMap((id) => {
      const block = state.resumeBlocks.find((item) => item.id === id)
      return block ? [copyBlock(block)] : []
    }),
    profile: { ...state.profile },
    compact: state.compact,
  }
}

export function hasPresetChanges(snapshot: ResumeSnapshot, preset: ResumePreset | undefined): boolean {
  if (!preset || snapshot.compact !== preset.compact || snapshot.blocks.length !== preset.blocks.length) return true
  if ((Object.keys(snapshot.profile) as (keyof ResumeProfile)[]).some((key) => snapshot.profile[key] !== preset.profile[key])) return true
  return snapshot.blocks.some((block, index) => {
    const saved = preset.blocks[index]
    return block.id !== saved.id || block.type !== saved.type || block.title !== saved.title
      || block.subtitle !== saved.subtitle || block.date !== saved.date
      || block.bullets.length !== saved.bullets.length
      || block.bullets.some((bullet, bulletIndex) => bullet !== saved.bullets[bulletIndex])
  })
}

export function isPresetNameAvailable(presets: ResumePreset[], name: string, exceptId?: string): boolean {
  const normalized = name.trim().toLowerCase()
  return normalized.length > 0 && !presets.some((preset) => preset.id !== exceptId && preset.name.trim().toLowerCase() === normalized)
}
