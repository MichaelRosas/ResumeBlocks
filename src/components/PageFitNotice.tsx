import type { PageFit } from './PrintResume'
import { Icon } from './Icon'

export function PageFitNotice({ fit, compact }: { fit: PageFit; compact: boolean }) {
  return (
    <div className={`page-fit-notice ${fit === 'overflow' ? 'is-overflow' : ''}`} role="status">
      <Icon name={fit === 'fits' ? 'check' : 'file'} size={16} />
      <div>
        <strong>{fit === 'measuring' ? 'Checking page fit…' : fit === 'fits' ? 'Fits one US Letter page' : 'Exceeds one US Letter page'}</strong>
        <p>{fit === 'overflow'
          ? `${compact ? 'Shorten bullet points or remove a block' : 'Try Compact spacing, shorter bullet points, or fewer blocks'} to fit one page. Extra content will print on additional pages.`
          : 'Based on Letter paper, 100% scale, and 0.5-inch margins. Final pagination appears in the print preview.'}</p>
      </div>
    </div>
  )
}
