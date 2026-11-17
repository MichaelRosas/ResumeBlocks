import type { ResumeFormatting } from './types.js'

export const fontChoices = {
  georgia: { label: 'Georgia', family: 'Georgia, Gelasio, serif' },
  times: { label: 'Times New Roman', family: '"Times New Roman", Tinos, serif' },
  arial: { label: 'Arial', family: 'Arial, Arimo, sans-serif' },
  calibri: { label: 'Calibri-style (Carlito)', family: 'Carlito, Calibri, sans-serif' },
  cambria: { label: 'Cambria-style (Caladea)', family: 'Caladea, Cambria, serif' },
  garamond: { label: 'EB Garamond', family: '"EB Garamond", Garamond, serif' },
  lato: { label: 'Lato', family: 'Lato, Arial, sans-serif' },
} as const
export const fontSizes = [10, 10.5, 11, 11.5, 12]
export const lineSpacings = [{ value: 1.2, label: 'Tight' }, { value: 1.35, label: 'Standard' }, { value: 1.5, label: 'Relaxed' }]
export const sectionSpacings = [{ value: 8, label: 'Small' }, { value: 12, label: 'Medium' }, { value: 18, label: 'Large' }]
export const pageMargins = [{ value: 0.5, label: 'Narrow — 0.5 in' }, { value: 0.65, label: 'Standard — 0.65 in' }, { value: 0.75, label: 'Wide — 0.75 in' }]

export const standardFormatting: Readonly<ResumeFormatting> = Object.freeze({
  font: 'georgia', fontSize: 10, lineSpacing: 1.35, sectionSpacing: 12, pageMargin: 0.5, headerAlignment: 'center',
})
export const compactFormatting: Readonly<ResumeFormatting> = Object.freeze({
  ...standardFormatting, lineSpacing: 1.2, sectionSpacing: 8,
})

export function formattingFromCompact(compact: boolean): ResumeFormatting {
  return { ...(compact ? compactFormatting : standardFormatting) }
}

export function isFormatting(value: unknown): value is ResumeFormatting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.font === 'string' && Object.hasOwn(fontChoices, candidate.font)
    && fontSizes.some((size) => size === candidate.fontSize)
    && lineSpacings.some((option) => option.value === candidate.lineSpacing)
    && sectionSpacings.some((option) => option.value === candidate.sectionSpacing)
    && pageMargins.some((option) => option.value === candidate.pageMargin)
    && (candidate.headerAlignment === 'left' || candidate.headerAlignment === 'center')
}

export function sameFormatting(left: ResumeFormatting, right: ResumeFormatting): boolean {
  return (Object.keys(standardFormatting) as (keyof ResumeFormatting)[]).every((key) => left[key] === right[key])
}

