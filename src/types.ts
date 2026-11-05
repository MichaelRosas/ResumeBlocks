export type BlockType = 'education' | 'experience' | 'project' | 'skills'

export interface ResumeBlock {
  id: string
  type: BlockType
  title: string
  subtitle: string
  date?: string
  bullets: string[]
}

export interface ResumeProfile {
  name: string
  headline: string
  email: string
  location: string
  website: string
}

export interface ResumeSnapshot {
  blocks: ResumeBlock[]
  profile: ResumeProfile
  compact: boolean
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
