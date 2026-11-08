import type { ResumeBlock } from './types'

export const MAX_JOB_DESCRIPTION = 12_000
export const sectionOrder = ['education', 'experience', 'project', 'skills'] as const

export interface TailoringRequest {
  jobDescription: string
  blocks: ResumeBlock[]
  selectedIds: string[]
}

export interface TailoringResult {
  summary: string
  recommendations: { blockId: string; reason: string }[]
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, max: number, allowEmpty = false): value is string {
  return typeof value === 'string' && value.length <= max && (allowEmpty || value.trim().length > 0)
}

// Shared by the server and client so unrecognized content never becomes resume text.
export function parseTailoringRequest(value: unknown): TailoringRequest {
  if (!record(value) || !text(value.jobDescription, MAX_JOB_DESCRIPTION) || value.jobDescription.trim().length < 40) {
    throw new Error(`Paste a job description between 40 and ${MAX_JOB_DESCRIPTION.toLocaleString()} characters.`)
  }
  if (!Array.isArray(value.blocks) || !value.blocks.length || value.blocks.length > 50) {
    throw new Error('Tailoring supports between 1 and 50 available blocks.')
  }
  const blocks: ResumeBlock[] = value.blocks.map((block: unknown) => {
    if (!record(block) || !text(block.id, 200) || !sectionOrder.includes(block.type as ResumeBlock['type'])
      || !text(block.title, 500) || !text(block.subtitle, 1000, true)
      || (block.date !== undefined && !text(block.date, 200, true))
      || !Array.isArray(block.bullets) || block.bullets.length > 50
      || !block.bullets.every((bullet: unknown) => text(bullet, 4000, true))) {
      throw new Error('A block is too large or has invalid content. Shorten it before tailoring.')
    }
    return {
      id: block.id, type: block.type as ResumeBlock['type'], title: block.title,
      subtitle: block.subtitle, ...(block.date === undefined ? {} : { date: block.date as string }),
      bullets: [...block.bullets] as string[],
    }
  })
  const ids = new Set(blocks.map((block) => block.id))
  if (ids.size !== blocks.length || !Array.isArray(value.selectedIds)
    || value.selectedIds.some((id: unknown) => typeof id !== 'string' || !ids.has(id))
    || new Set(value.selectedIds).size !== value.selectedIds.length) {
    throw new Error('The available blocks changed. Close tailoring and try again.')
  }
  const request = { jobDescription: value.jobDescription.trim(), blocks, selectedIds: value.selectedIds as string[] }
  if (JSON.stringify(request).length > 96_000) throw new Error('Your block library is too large to tailor in one request. Shorten its content and try again.')
  return request
}

export function parseTailoringResult(value: unknown, blocks: ResumeBlock[]): TailoringResult {
  const invalid = 'The suggestions could not be verified. Please try again.'
  if (!record(value) || !text(value.summary, 2000) || !Array.isArray(value.recommendations)
    || value.recommendations.length > blocks.length) throw new Error(invalid)
  const ids = new Set(blocks.map((block) => block.id))
  const seen = new Set<string>()
  const recommendations = value.recommendations.map((item: unknown) => {
    if (!record(item) || typeof item.blockId !== 'string' || !ids.has(item.blockId)
      || seen.has(item.blockId) || !text(item.reason, 1000)) throw new Error(invalid)
    seen.add(item.blockId)
    return { blockId: item.blockId, reason: item.reason }
  })
  return { summary: value.summary, recommendations }
}

export function orderBySection(blocks: ResumeBlock[]): ResumeBlock[] {
  return sectionOrder.flatMap((type) => blocks.filter((block) => block.type === type))
}
