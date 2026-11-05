import { useState } from 'react'
import { useDroppable } from '@dnd-kit/react'
import { blockLabels } from '../types'
import type { ResumeBlock, ResumePreset } from '../types'
import type { SaveStatus } from '../state/workspaceStorage'
import { Icon } from './Icon'
import { LibraryBlockCard } from './LibraryBlockCard'

interface BlockLibraryProps {
  blocks: ResumeBlock[]
  selectedIds: string[]
  presets: ResumePreset[]
  activePresetId: string | null
  onToggleBlock: (id: string) => void
  onSelectPreset: (preset: ResumePreset) => void
  onCreateBlock: () => void
  onEditBlock: (block: ResumeBlock) => void
  saveStatus: SaveStatus
  draggingFromResume: boolean
  onManagePreset: (preset: ResumePreset) => void
}

export function BlockLibrary({ blocks, selectedIds, presets, activePresetId, onToggleBlock, onSelectPreset, onCreateBlock, onEditBlock, saveStatus, draggingFromResume, onManagePreset }: BlockLibraryProps) {
  const [search, setSearch] = useState('')
  const { ref, isDropTarget } = useDroppable({
    id: 'block-library',
    accept: (source) => source.data.kind === 'resume-block',
    data: { kind: 'library' },
  })
  const query = search.trim().toLowerCase()
  const filteredBlocks = blocks.filter((block) =>
    `${block.title} ${block.subtitle} ${blockLabels[block.type]} ${block.bullets.join(' ')}`.toLowerCase().includes(query),
  )

  return (
    <aside ref={ref} className={`library ${isDropTarget ? 'is-library-drop-target' : ''}`} aria-label="Block library and presets">
      <a className="brand" href="#main-content" aria-label="ResumeBlocks, skip to builder">
        <span className="brand-mark"><Icon name="blocks" size={23} /></span>
        <span>Resume<span className="brand-light">Blocks</span><small>YOUR EXPERIENCE, REASSEMBLED.</small></span>
      </a>

      <div className="library-heading"><h2>Stored blocks</h2><span className="count">{blocks.length}</span></div>
      <p className="library-intro">Your experience. Ready to reuse.</p>
      <label className="search-field"><Icon name="search" size={17} /><input type="search" aria-label="Search blocks" placeholder="Search your blocks…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <button type="button" className="add-block-button" data-editor-fallback onClick={() => { setSearch(''); onCreateBlock() }}><Icon name="plus" size={17} /> Add new block</button>
      {draggingFromResume && <p className="library-drop-hint">Drop here to remove from the resume and keep in your library.</p>}

      <div className="block-list">
        {filteredBlocks.map((block) => {
          const included = selectedIds.includes(block.id)
          return (
            <LibraryBlockCard key={block.id} block={block} included={included} onToggle={() => onToggleBlock(block.id)} onEdit={() => onEditBlock(block)} />
          )
        })}
        {filteredBlocks.length === 0 && <p className="no-results">{blocks.length === 0 ? 'Your library is empty. Add a block to get started.' : `No blocks match “${search}”. Try a project, skill, or company.`}</p>}
      </div>
      <p className="library-hint"><Icon name="grip" size={14} /> Drag a handle to add. Click a card to toggle.</p>

      <section className="presets" aria-labelledby="presets-heading">
        <div className="library-heading"><h2 id="presets-heading">Saved presets</h2><span className="count">{presets.length}</span></div>
        <div className="preset-list">
          {presets.map((preset) => <div key={preset.id} className="preset-row">
            <button type="button" className={`preset ${preset.id === activePresetId ? 'is-active' : ''}`} aria-pressed={preset.id === activePresetId} onClick={() => onSelectPreset(preset)}><Icon name="file" size={20} /><span><strong>{preset.name}</strong><small>{preset.description || `${preset.blocks.length} blocks`}</small></span></button>
            <button type="button" className="manage-preset-button" aria-label={`Manage ${preset.name}`} title="Rename or delete preset" onClick={() => onManagePreset(preset)}><Icon name="edit" size={15} /></button>
          </div>)}
          {presets.length === 0 && <p className="no-results">No saved presets yet. Use Save as new to keep this resume.</p>}
        </div>
      </section>
      <div className={`library-footer save-status-${saveStatus}`} role="status">
        <span className="status-dot" />
        <span>
          {saveStatus === 'saved' ? 'Saved in this browser' : saveStatus === 'saving' ? 'Saving changes…' : 'Changes not saved'}
          <small>{saveStatus === 'blocked' || saveStatus === 'error' ? 'Keep this page open and retry saving.' : 'Available in this browser only.'}</small>
        </span>
      </div>
    </aside>
  )
}
