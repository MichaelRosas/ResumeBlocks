import { useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { BlockEditor } from './components/BlockEditor'
import { BlockLibrary } from './components/BlockLibrary'
import { BuilderTools } from './components/BuilderTools'
import { Icon } from './components/Icon'
import { ProfileEditor } from './components/ProfileEditor'
import { ResumePreview } from './components/ResumePreview'
import { StorageNotice } from './components/StorageNotice'
import { useWorkspace } from './state/useWorkspace'
import type { ResumeBlock, ResumePreset, ResumeProfile } from './types'

type Editor = { type: 'block'; block: ResumeBlock | null } | { type: 'profile' } | null

export default function App() {
  const { state, dispatch, saveStatus, loadIssue, retrySave, replaceSavedWorkspace } = useWorkspace()
  const [announcement, setAnnouncement] = useState('')
  const [editor, setEditor] = useState<Editor>(null)
  const [activeDrag, setActiveDrag] = useState<{ block: ResumeBlock; fromResume: boolean } | null>(null)
  const activePreset = state.presets.find((preset) => preset.id === state.presetId)!
  const selectedBlocks = state.selectedIds.flatMap((id) => {
    const block = state.blocks.find((item) => item.id === id)
    return block ? [block] : []
  })

  function toggleBlock(id: string) {
    const block = state.blocks.find((item) => item.id === id)
    if (!block) return
    setAnnouncement(`${block.title} ${state.selectedIds.includes(id) ? 'removed from the resume. It is still in your library.' : 'added to the resume.'}`)
    dispatch({ type: 'toggleBlock', id })
  }

  function selectPreset(preset: ResumePreset) {
    dispatch({ type: 'selectPreset', id: preset.id })
    setAnnouncement(`${preset.name} block selection loaded.`)
  }

  function saveBlock(block: ResumeBlock, includeInResume: boolean) {
    dispatch({ type: 'saveBlock', block, includeInResume })
    setEditor(null)
    setAnnouncement(`${block.title} ${state.blocks.some((item) => item.id === block.id) ? 'updated in' : 'added to'} your library${includeInResume ? ' and included in the current resume' : ''}.`)
  }

  function deleteBlock(block: ResumeBlock) {
    dispatch({ type: 'deleteBlock', id: block.id })
    setEditor(null)
    setAnnouncement(`${block.title} deleted from your library and all resume selections.`)
  }

  function saveProfile(profile: ResumeProfile) {
    dispatch({ type: 'saveProfile', profile })
    setEditor(null)
    setAnnouncement('Contact details updated.')
  }

  function placeBlock(id: string, index: number) {
    dispatch({ type: 'placeBlock', id, index })
    const block = state.blocks.find((item) => item.id === id)
    if (block) setAnnouncement(`${block.title} placed at position ${index + 1} in ${block.type === 'project' ? 'projects' : block.type}.`)
  }

  function finishDrag(event: DragEndEvent) {
    setActiveDrag(null)
    const { source, target } = event.operation
    if (event.canceled || !source || !target) {
      setAnnouncement('Drag cancelled. Your resume is unchanged.')
      return
    }
    const block = state.blocks.find((item) => item.id === source.data.blockId)
    if (!block) return
    if (target.data.kind === 'library') {
      if (source.data.kind === 'resume-block') {
        dispatch({ type: 'removeBlock', id: block.id })
        setAnnouncement(`${block.title} removed from the resume and kept in your library.`)
      }
      return
    }
    if (target.data.kind !== 'resume-page' && target.data.kind !== 'resume-section' && target.data.kind !== 'resume-block') return
    if (target.data.blockType && target.data.blockType !== block.type) return
    const peers = selectedBlocks.filter((item) => item.type === block.type && item.id !== block.id)
    const index = source.data.kind === 'resume-block' && isSortable(source)
      ? source.index
      : target.data.kind === 'resume-block' ? target.data.index : peers.length
    placeBlock(block.id, index)
  }

  return (
    <DragDropProvider
      onDragStart={(event) => {
        const source = event.operation.source
        const block = state.blocks.find((item) => item.id === source?.data.blockId)
        if (block) setActiveDrag({ block, fromResume: source?.data.kind === 'resume-block' })
      }}
      onDragEnd={finishDrag}
    >
    <div className="app-shell">
      <BlockLibrary
        blocks={state.blocks}
        selectedIds={state.selectedIds}
        presets={state.presets}
        activePresetId={state.presetId}
        onToggleBlock={toggleBlock}
        onSelectPreset={selectPreset}
        onCreateBlock={() => setEditor({ type: 'block', block: null })}
        onEditBlock={(block) => setEditor({ type: 'block', block })}
        saveStatus={saveStatus}
        draggingFromResume={activeDrag?.fromResume ?? false}
      />
      <main id="main-content" className="workspace" tabIndex={-1}>
        <header className="workspace-header">
          <div>
            <div className="breadcrumb">WORKSPACE <Icon name="chevron" size={12} /> RESUME BUILDER</div>
            <h1>Build your next opportunity.</h1>
            <p>Bring your experience together. One block at a time.</p>
          </div>
          <span className={`demo-tag save-status-${saveStatus}`}><span />{saveStatus === 'saved' ? 'Saved in this browser' : saveStatus === 'saving' ? 'Saving changes…' : 'Changes not saved'}</span>
        </header>
        <StorageNotice status={saveStatus} loadIssue={loadIssue} onRetry={retrySave} onReplace={replaceSavedWorkspace} />
        <div className="builder-layout">
          <section className="canvas" aria-labelledby="resume-name">
            <div className="canvas-toolbar">
              <div className="document-title">
                <Icon name="file" size={19} />
                <div>
                  <h2 id="resume-name">{activePreset.name}</h2>
                  <span>{state.modified ? 'Edited workspace' : 'Example preset'} · {saveStatus === 'saved' ? 'saved in this browser' : saveStatus === 'saving' ? 'saving…' : 'not saved'}</span>
                </div>
              </div>
              <span className="block-total">{selectedBlocks.length} blocks included</span>
            </div>
            <div className="paper-surround">
              <ResumePreview profile={state.profile} blocks={selectedBlocks} compact={state.compact} onRemoveBlock={toggleBlock} onMoveBlock={placeBlock} activeBlock={activeDrag?.block ?? null} />
            </div>
            <p className="canvas-caption"><Icon name="grip" size={14} /> Drag handles to reorder within a section, or use the up/down buttons.</p>
          </section>
          <BuilderTools
            compact={state.compact}
            onCompactChange={(compact) => dispatch({ type: 'setCompact', compact })}
            onReset={() => { selectPreset(activePreset); dispatch({ type: 'setCompact', compact: false }) }}
            onEditProfile={() => setEditor({ type: 'profile' })}
          />
        </div>
        <p className="screen-reader-only" role="status" aria-live="polite">{announcement}</p>
      </main>
      {editor?.type === 'block' && (
        <BlockEditor
          block={editor.block}
          included={editor.block ? state.selectedIds.includes(editor.block.id) : true}
          onSave={saveBlock}
          onDelete={deleteBlock}
          onClose={() => setEditor(null)}
        />
      )}
      {editor?.type === 'profile' && <ProfileEditor profile={state.profile} onSave={saveProfile} onClose={() => setEditor(null)} />}
    </div>
    </DragDropProvider>
  )
}
