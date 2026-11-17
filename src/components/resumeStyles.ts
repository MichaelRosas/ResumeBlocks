import type { CSSProperties } from 'react'
import type { ResumeFormatting } from '../types'
import { fontChoices } from '../formatting'

export function resumeStyles(formatting: ResumeFormatting): CSSProperties {
  return {
    '--resume-font': fontChoices[formatting.font].family,
    '--resume-font-size': `${formatting.fontSize}pt`,
    '--resume-title-size': `${formatting.fontSize + 1}pt`,
    '--resume-date-size': `${formatting.fontSize - 1}pt`,
    '--resume-subtitle-size': `${formatting.fontSize - 0.5}pt`,
    '--resume-contact-size': `${formatting.fontSize - 1.5}pt`,
    '--resume-name-size': `${formatting.fontSize + 14}pt`,
    '--resume-line-spacing': formatting.lineSpacing,
    '--resume-section-gap': `${formatting.sectionSpacing}pt`,
    '--resume-block-gap': `${formatting.sectionSpacing * 2 / 3}pt`,
    '--resume-heading-gap': `${formatting.sectionSpacing / 2}pt`,
    '--resume-header-gap': `${formatting.sectionSpacing * 4 / 3}pt`,
    '--resume-margin': `${formatting.pageMargin}in`,
    '--resume-header-alignment': formatting.headerAlignment,
    '--resume-contact-align': formatting.headerAlignment === 'left' ? 'flex-start' : 'center',
  } as CSSProperties
}
