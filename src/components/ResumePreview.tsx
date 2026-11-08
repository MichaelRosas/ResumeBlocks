import { useDroppable } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import type { BlockType, ResumeBlock, ResumeProfile } from '../types'
import { blockLabels } from '../types'
import { Icon } from './Icon'
import { ResumeBlockContent, ResumeHeader } from './ResumeDocument'

interface ResumePreviewProps {
  profile: ResumeProfile
  blocks: ResumeBlock[]
  compact: boolean
  onRemoveBlock: (id: string) => void
  onMoveBlock: (id: string, index: number) => void
  activeBlock: ResumeBlock | null
}

function SortableResumeBlock({ block, index, count, onRemove, onMove }: {
  block: ResumeBlock
  index: number
  count: number
  onRemove: () => void
  onMove: (index: number) => void
}) {
  const { ref, handleRef, isDragSource, isDropTarget } = useSortable({
    id: `resume:${block.id}`,
    index,
    group: block.type,
    type: `block:${block.type}`,
    accept: `block:${block.type}`,
    collisionPriority: 10,
    data: { kind: 'resume-block', blockId: block.id, blockType: block.type, index },
  })

  return (
    <div ref={ref} className={`resume-block ${isDragSource ? 'is-drag-source' : ''} ${isDropTarget ? 'is-block-drop-target' : ''}`}>
      <button ref={handleRef} className="resume-drag-handle" type="button" aria-label={`Reorder ${block.title}`} title="Drag to reorder; or use Space, arrow keys, and Space to drop"><Icon name="grip" size={16} /></button>
      <div className="resume-order-actions">
        <button type="button" aria-label={`Move ${block.title} up`} title="Move up" disabled={index === 0} onClick={() => onMove(index - 1)}><Icon name="up" size={14} /></button>
        <button type="button" aria-label={`Move ${block.title} down`} title="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)}><Icon name="down" size={14} /></button>
        <button type="button" onClick={onRemove} aria-label={`Remove ${block.title} from resume`} title="Remove from resume; keep in library"><Icon name="close" size={13} /></button>
      </div>
      <ResumeBlockContent block={block} />
    </div>
  )
}

function ResumeSection({ type, blocks, active, onRemoveBlock, onMoveBlock }: {
  type: BlockType
  blocks: ResumeBlock[]
  active: boolean
  onRemoveBlock: (id: string) => void
  onMoveBlock: (id: string, index: number) => void
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `section:${type}`,
    accept: `block:${type}`,
    collisionPriority: 0,
    data: { kind: 'resume-section', blockType: type },
  })

  return (
    <section ref={ref} className={`resume-section ${active ? 'is-section-drag-active' : ''} ${isDropTarget ? 'is-section-drop-target' : ''}`} aria-label={blockLabels[type]}>
      <h3>{blockLabels[type]}</h3>
      {blocks.map((block, index) => (
        <SortableResumeBlock key={block.id} block={block} index={index} count={blocks.length} onRemove={() => onRemoveBlock(block.id)} onMove={(nextIndex) => onMoveBlock(block.id, nextIndex)} />
      ))}
      {blocks.length === 0 && <p className="empty-section-drop">Drop here to add to {blockLabels[type].toLowerCase()}.</p>}
    </section>
  )
}

export function ResumePreview({ profile, blocks, compact, onRemoveBlock, onMoveBlock, activeBlock }: ResumePreviewProps) {
  const { ref, isDropTarget } = useDroppable({
    id: 'resume-page',
    accept: (source) => source.data.kind === 'library-block',
    collisionPriority: -10,
    data: { kind: 'resume-page' },
  })

  return (
    <article ref={ref} className={`resume-page ${compact ? 'is-compact' : ''} ${isDropTarget ? 'is-page-drop-target' : ''}`} aria-label="Resume preview">
      <ResumeHeader profile={profile} />
      {(['education', 'experience', 'project', 'skills'] as const).map((type) => {
        const sectionBlocks = blocks.filter((block) => block.type === type)
        if (sectionBlocks.length === 0 && activeBlock?.type !== type) return null
        return (
          <ResumeSection key={type} type={type} blocks={sectionBlocks} active={activeBlock?.type === type} onRemoveBlock={onRemoveBlock} onMoveBlock={onMoveBlock} />
        )
      })}
      {blocks.length === 0 && !activeBlock && <div className="empty-resume"><Icon name="blocks" size={32} /><h3>Start with a building block.</h3><p>Drag a block from your library, or click its card to add it here.</p></div>}
    </article>
  )
}
