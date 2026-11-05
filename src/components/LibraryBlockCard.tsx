import { useDraggable } from '@dnd-kit/react'
import type { ResumeBlock } from '../types'
import { blockLabels } from '../types'
import { Icon } from './Icon'

export function LibraryBlockCard({ block, included, onToggle, onEdit }: {
  block: ResumeBlock
  included: boolean
  onToggle: () => void
  onEdit: () => void
}) {
  const { ref, handleRef, isDragSource } = useDraggable({
    id: `library:${block.id}`,
    type: `block:${block.type}`,
    disabled: included,
    data: { kind: 'library-block', blockId: block.id },
  })

  return (
    <div ref={ref} className={`library-block-row ${isDragSource ? 'is-drag-source' : ''}`}>
      <button
        ref={handleRef}
        type="button"
        className="library-drag-handle"
        aria-label={`Drag ${block.title} into resume`}
        title={included ? 'Already included in your resume' : 'Drag into your resume'}
        disabled={included}
      ><Icon name="grip" size={19} /></button>
      <button
        type="button"
        className={`library-block ${included ? 'is-included' : ''}`}
        aria-pressed={included}
        aria-label={`${included ? 'Remove' : 'Add'} ${block.title} ${included ? 'from' : 'to'} resume`}
        onClick={onToggle}
      >
        <span className="block-info">
          <span className="block-kind">{blockLabels[block.type]}</span>
          <strong>{block.title}</strong>
          <span className="block-subtitle">{block.subtitle}</span>
        </span>
        <span className={`block-toggle ${included ? 'is-included' : ''}`}><Icon name={included ? 'check' : 'plus'} size={15} /></span>
      </button>
      <button type="button" className="edit-library-block" aria-label={`Edit ${block.title}`} title={`Edit ${block.title}`} onClick={onEdit}><Icon name="edit" size={16} /></button>
    </div>
  )
}
