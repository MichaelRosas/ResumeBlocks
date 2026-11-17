import type { PageFit } from './PrintResume'
import { Icon } from './Icon'
import type { ResumeFormatting } from '../types'

export function PageFitNotice({ fit, formatting }: { fit: PageFit; formatting: ResumeFormatting }) {
  return (
    <div className={`page-fit-notice ${fit === 'overflow' ? 'is-overflow' : ''}`} role="status">
      <Icon name={fit === 'fits' ? 'check' : 'file'} size={16} />
      <div>
        <strong>{fit === 'measuring' ? 'Checking page fit…' : fit === 'fits' ? 'Fits one US Letter page' : 'Exceeds one US Letter page'}</strong>
        <p>{fit === 'overflow'
          ? 'Try smaller text, tighter spacing, narrower margins, or fewer blocks. Extra content will print on additional pages.'
          : `Letter paper · 100% scale · ${formatting.pageMargin}-inch margins. Confirm pagination in the print preview.`}</p>
      </div>
    </div>
  )
}
