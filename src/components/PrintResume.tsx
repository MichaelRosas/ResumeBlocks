import { useLayoutEffect, useRef } from 'react'
import type { ResumeBlock, ResumeProfile } from '../types'
import { ResumeDocument } from './ResumeDocument'

export type PageFit = 'measuring' | 'fits' | 'overflow'

// Letter is 11 inches high, with the half-inch top/bottom margins in print.css.
const PRINTABLE_HEIGHT_PX = 10 * 96

export function PrintResume({ profile, blocks, compact, onPageFitChange }: {
  profile: ResumeProfile
  blocks: ResumeBlock[]
  compact: boolean
  onPageFitChange: (fit: PageFit) => void
}) {
  const documentRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    let active = true
    const measure = () => {
      if (!active || !documentRef.current) return
      const height = documentRef.current.getBoundingClientRect().height
      onPageFitChange(height <= PRINTABLE_HEIGHT_PX ? 'fits' : 'overflow')
    }
    measure()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (documentRef.current) observer?.observe(documentRef.current)
    void document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => {
      active = false
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [profile, blocks, compact, onPageFitChange])

  return <div className="print-output"><ResumeDocument profile={profile} blocks={blocks} compact={compact} elementRef={documentRef} /></div>
}
