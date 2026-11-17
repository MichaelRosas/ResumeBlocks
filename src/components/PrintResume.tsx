import { useLayoutEffect, useRef } from 'react'
import type { ResumeBlock, ResumeFormatting, ResumeProfile } from '../types'
import { ResumeDocument } from './ResumeDocument'

export type PageFit = 'measuring' | 'fits' | 'overflow'

// The shared document includes its selected page margins during measurement.
const LETTER_HEIGHT_PX = 11 * 96

export function PrintResume({ profile, blocks, formatting, onPageFitChange }: {
  profile: ResumeProfile
  blocks: ResumeBlock[]
  formatting: ResumeFormatting
  onPageFitChange: (fit: PageFit) => void
}) {
  const documentRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    let active = true
    const measure = () => {
      if (!active || !documentRef.current) return
      const height = documentRef.current.getBoundingClientRect().height
      onPageFitChange(height <= LETTER_HEIGHT_PX + 0.5 ? 'fits' : 'overflow')
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
  }, [profile, blocks, formatting, onPageFitChange])

  return <div className="print-output">
    <style media="print">{`@page { size: letter; margin: ${formatting.pageMargin}in; }`}</style>
    <ResumeDocument profile={profile} blocks={blocks} formatting={formatting} elementRef={documentRef} />
  </div>
}
