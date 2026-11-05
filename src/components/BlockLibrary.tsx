import { useState } from 'react'
import { blockLabels } from '../types'
import type { ResumeBlock, ResumePreset } from '../types'
import type { SaveStatus } from '../state/workspaceStorage'
import { Icon } from './Icon'

interface BlockLibraryProps {
  blocks: ResumeBlock[]
  selectedIds: string[]
  presets: ResumePreset[]
  activePresetId: string
  onToggleBlock: (id: string) => void
  onSelectPreset: (preset: ResumePreset) => void
  onCreateBlock: () => void
  onEditBlock: (block: ResumeBlock) => void
  saveStatus: SaveStatus
}

export function BlockLibrary({ blocks, selectedIds, presets, activePresetId, onToggleBlock, onSelectPreset, onCreateBlock, onEditBlock, saveStatus }: BlockLibraryProps) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const filteredBlocks = blocks.filter((block) =>
    `${block.title} ${block.subtitle} ${blockLabels[block.type]} ${block.bullets.join(' ')}`.toLowerCase().includes(query),
  )

  return (
    <aside className="library" aria-label="Block library and presets">
      <a className="brand" href="#main-content" aria-label="ResumeBlocks, skip to builder">
        <span className="brand-mark"><Icon name="blocks" size={23} /></span>
        <span>Resume<span className="brand-light">Blocks</span><small>YOUR EXPERIENCE, REASSEMBLED.</small></span>
      </a>

      <div className="library-heading"><h2>Stored blocks</h2><span className="count">{blocks.length}</span></div>
      <p className="library-intro">Your experience. Ready to reuse.</p>
      <label className="search-field"><Icon name="search" size={17} /><input type="search" aria-label="Search blocks" placeholder="Search your blocks…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <button type="button" className="add-block-button" data-editor-fallback onClick={() => { setSearch(''); onCreateBlock() }}><Icon name="plus" size={17} /> Add new block</button>

      <div className="block-list">
        {filteredBlocks.map((block) => {
          const included = selectedIds.includes(block.id)
          return (
            <div key={block.id} className="library-block-row">
              <button type="button" className={`library-block ${included ? 'is-included' : ''}`} aria-pressed={included} aria-label={`${included ? 'Remove' : 'Add'} ${block.title} ${included ? 'from' : 'to'} resume`} onClick={() => onToggleBlock(block.id)}>
                <span className={`block-icon icon-${block.type}`}><Icon name={block.type} size={19} /></span>
                <span className="block-info"><span className="block-kind">{blockLabels[block.type]}</span><strong>{block.title}</strong><span className="block-subtitle">{block.subtitle}</span></span>
                <span className={`block-toggle ${included ? 'is-included' : ''}`}><Icon name={included ? 'check' : 'plus'} size={15} /></span>
              </button>
              <button type="button" className="edit-library-block" aria-label={`Edit ${block.title}`} title={`Edit ${block.title}`} onClick={() => onEditBlock(block)}><Icon name="edit" size={16} /></button>
            </div>
          )
        })}
        {filteredBlocks.length === 0 && <p className="no-results">{blocks.length === 0 ? 'Your library is empty. Add a block to get started.' : `No blocks match “${search}”. Try a project, skill, or company.`}</p>}
      </div>
      <p className="library-hint"><Icon name="plus" size={14} /> Click a block to add or remove it.</p>

      <section className="presets" aria-labelledby="presets-heading">
        <div className="library-heading"><h2 id="presets-heading">Resume presets</h2><span className="sample-badge">Examples</span></div>
        <div className="preset-list">
          {presets.map((preset) => <button key={preset.id} type="button" className={`preset ${preset.id === activePresetId ? 'is-active' : ''}`} aria-pressed={preset.id === activePresetId} onClick={() => onSelectPreset(preset)}><Icon name="file" size={20} /><span><strong>{preset.name}</strong><small>{preset.description}</small></span><Icon name="chevron" size={15} /></button>)}
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
