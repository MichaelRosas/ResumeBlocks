export type BlockType = 'education' | 'experience' | 'project' | 'skills'
export type BlockContentFormat = 'bullets' | 'paragraphs'

export interface ResumeBlock {
  id: string
  type: BlockType
  title: string
  subtitle: string
  date?: string
  bullets: string[]
  contentFormat?: BlockContentFormat
}

export function getBlockContentFormat(block: Pick<ResumeBlock, 'type' | 'contentFormat'>): BlockContentFormat {
  return block.contentFormat ?? (block.type === 'skills' ? 'paragraphs' : 'bullets')
}

export interface ResumeProfile {
  name: string
  headline: string
  email: string
  location: string
  website: string
}

export interface ResumeFormatting {
  font: 'georgia' | 'times' | 'arial' | 'calibri' | 'cambria' | 'garamond' | 'lato'
  fontSize: number
  lineSpacing: number
  sectionSpacing: number
  pageMargin: number
  headerAlignment: 'left' | 'center'
}

export interface ResumeSnapshot {
  blocks: ResumeBlock[]
  profile: ResumeProfile
  formatting: ResumeFormatting
}

export interface ResumePreset extends ResumeSnapshot {
  id: string
  name: string
  description: string
}

export const blockLabels: Record<BlockType, string> = {
  education: 'Education',
  experience: 'Experience',
  project: 'Projects',
  skills: 'Skills',
}
