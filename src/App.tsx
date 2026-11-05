import { useReducer, useState } from 'react'
import { BlockLibrary } from './components/BlockLibrary'
import { BuilderTools } from './components/BuilderTools'
import { Icon } from './components/Icon'
import { ResumePreview } from './components/ResumePreview'
import { sampleBlocks, samplePresets, sampleProfile } from './data/sampleResume'
import type { ResumePreset } from './types'

type BuilderState = { presetId: string; selectedIds: string[]; modified: boolean }
type BuilderAction = { type: 'toggleBlock'; id: string } | { type: 'selectPreset'; preset: ResumePreset }

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  if (action.type === 'selectPreset') return { presetId: action.preset.id, selectedIds: [...action.preset.blockIds], modified: false }
  const included = state.selectedIds.includes(action.id)
  return { ...state, modified: true, selectedIds: included ? state.selectedIds.filter((id) => id !== action.id) : [...state.selectedIds, action.id] }
}

export default function App() {
  const [state, dispatch] = useReducer(builderReducer, { presetId: samplePresets[0].id, selectedIds: [...samplePresets[0].blockIds], modified: false })
  const [compact, setCompact] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const activePreset = samplePresets.find((preset) => preset.id === state.presetId)!
  const selectedBlocks = state.selectedIds.flatMap((id) => {
    const block = sampleBlocks.find((item) => item.id === id)
    return block ? [block] : []
  })

  function toggleBlock(id: string) {
    const block = sampleBlocks.find((item) => item.id === id)!
    setAnnouncement(`${block.title} ${state.selectedIds.includes(id) ? 'removed from the resume. It is still in your library.' : 'added to the resume.'}`)
    dispatch({ type: 'toggleBlock', id })
  }

  function selectPreset(preset: ResumePreset) {
    dispatch({ type: 'selectPreset', preset })
    setAnnouncement(`${preset.name} example loaded. Previous unsaved changes have been reset.`)
  }

  return (
    <div className="app-shell">
      <BlockLibrary blocks={sampleBlocks} selectedIds={state.selectedIds} presets={samplePresets} activePresetId={state.presetId} onToggleBlock={toggleBlock} onSelectPreset={selectPreset} />
      <main id="main-content" className="workspace" tabIndex={-1}>
        <header className="workspace-header"><div><div className="breadcrumb">WORKSPACE <Icon name="chevron" size={12} /> RESUME BUILDER</div><h1>Build your next opportunity.</h1><p>Bring your experience together. One block at a time.</p></div><span className="demo-tag"><span /> Sample content</span></header>
        <div className="builder-layout"><section className="canvas" aria-labelledby="resume-name"><div className="canvas-toolbar"><div className="document-title"><Icon name="file" size={19} /><div><h2 id="resume-name">{activePreset.name}</h2><span>{state.modified ? 'Edited example · not saved' : 'Example preset'}</span></div></div><span className="block-total">{selectedBlocks.length} blocks included</span></div><div className="paper-surround"><ResumePreview profile={sampleProfile} blocks={selectedBlocks} compact={compact} onRemoveBlock={toggleBlock} /></div><p className="canvas-caption"><Icon name="check" size={14} /> Your preview updates as you add and remove blocks.</p></section><BuilderTools compact={compact} onCompactChange={setCompact} onReset={() => { selectPreset(activePreset); setCompact(false) }} /></div>
        <p className="screen-reader-only" role="status" aria-live="polite">{announcement}</p>
      </main>
    </div>
  )
}
