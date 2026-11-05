import type { CSSProperties } from 'react'

const paths = {
  blocks: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  education: 'm2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6M22 9v7',
  experience: 'M9 7V4h6v3M3 8h18v12H3zM3 12c6 4 12 4 18 0M10 13h4',
  project: 'm8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14',
  skills: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
  file: 'M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8M8 16h6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  sparkle: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  close: 'm6 6 12 12M6 18 18 6',
  chevron: 'm9 5 7 7-7 7',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d={paths[name]} />
    </svg>
  )
}
