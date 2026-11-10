import { useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { BlockEditor } from './components/BlockEditor'
import { ExportDialog } from './components/ExportDialog'
import { BlockLibrary } from './components/BlockLibrary'
import { BuilderTools } from './components/BuilderTools'
import { Icon } from './components/Icon'
import { ProfileEditor } from './components/ProfileEditor'
import { PresetEditor } from './components/PresetEditor'
import { PresetSwitchDialog } from './components/PresetSwitchDialog'
import { ResumePreview } from './components/ResumePreview'
import { PageFitNotice } from './components/PageFitNotice'
import { PrintResume } from './components/PrintResume'
import type { PageFit } from './components/PrintResume'
import { StorageNotice } from './components/StorageNotice'
import { TailoringDialog } from './components/TailoringDialog'
import { useWorkspace } from './state/useWorkspace'
import { usePrintTitle } from './state/usePrintTitle'
import type { ResumeBlock, ResumePreset, ResumeProfile } from './types'

type Editor = { type: 'block'; block: ResumeBlock | null } | { type: 'profile' }
  | { type: 'preset'; preset: ResumePreset | null }
  | { type: 'export' }
  | { type: 'tailor' }
  | { type: 'switch-preset'; target: ResumePreset; restore: boolean } | null

export default function App() {
  const { state, dispatch, saveStatus, loadIssue, retrySave, replaceSavedWorkspace } = useWorkspace()
  const [announcement, setAnnouncement] = useState('')
  const [editor, setEditor] = useState<Editor>(null)
  const [activeDrag, setActiveDrag] = useState<{ block: ResumeBlock; fromResume: boolean } | null>(null)
  const [pageFit, setPageFit] = useState<PageFit>('measuring')
  const activePreset = state.presets.find((preset) => preset.id === state.presetId)
  usePrintTitle(`${state.profile.name} - ${activePreset?.name ?? 'Resume'}`)
  const selectedBlocks = state.selectedIds.flatMap((id) => {
    const block = state.resumeBlocks.find((item) => item.id === id)
    return block ? [block] : []
  })

  function toggleBlock(id: string) {
    const block = state.resumeBlocks.find((item) => item.id === id) ?? state.blocks.find((item) => item.id === id)
    if (!block) return
    setAnnouncement(`${block.title} ${state.selectedIds.includes(id) ? 'removed from the resume. It is still in your library.' : 'added to the resume.'}`)
    dispatch({ type: 'toggleBlock', id })
  }

  function selectPreset(preset: ResumePreset) {
    if (preset.id === state.presetId) return
    if (state.modified) {
      setEditor({ type: 'switch-preset', target: preset, restore: false })
      return
    }
    dispatch({ type: 'selectPreset', id: preset.id })
    setAnnouncement(`${preset.name} opened.`)
  }

  function savePreset(name: string, description: string) {
    if (editor?.type !== 'preset') return
    if (editor.preset) dispatch({ type: 'renamePreset', id: editor.preset.id, name, description })
    else dispatch({ type: 'createPreset', id: crypto.randomUUID(), name, description })
    setEditor(null)
    setAnnouncement(`${name} ${editor.preset ? 'renamed' : 'saved as a separate preset'}.`)
  }

  function updatePreset() {
    dispatch({ type: 'updatePreset' })
    setAnnouncement(`${activePreset?.name ?? 'Preset'} updated with the current resume.`)
  }

  function openPendingPreset(saveFirst: boolean) {
    if (editor?.type !== 'switch-preset') return
    if (saveFirst) dispatch({ type: 'updatePreset' })
    dispatch({ type: 'selectPreset', id: editor.target.id })
    setEditor(null)
    setAnnouncement(`${editor.target.name} opened.`)
  }

  function saveBlock(block: ResumeBlock, includeInResume: boolean) {
    dispatch({ type: 'saveBlock', block, includeInResume })
    setEditor(null)
    setAnnouncement(`${block.title} ${state.blocks.some((item) => item.id === block.id) ? 'updated in' : 'added to'} your library${includeInResume ? ' and included in the current resume' : ''}.`)
  }

  function deleteBlock(block: ResumeBlock) {
    dispatch({ type: 'deleteBlock', id: block.id })
    setEditor(null)
    setAnnouncement(`${block.title} deleted from your library and current resume. Saved presets keep their copies.`)
  }

  function saveProfile(profile: ResumeProfile) {
    dispatch({ type: 'saveProfile', profile })
    setEditor(null)
    setAnnouncement('Contact details updated.')
  }

  function placeBlock(id: string, index: number) {
    dispatch({ type: 'placeBlock', id, index })
    const block = state.resumeBlocks.find((item) => item.id === id) ?? state.blocks.find((item) => item.id === id)
    if (block) setAnnouncement(`${block.title} placed at position ${index + 1} in ${block.type === 'project' ? 'projects' : block.type}.`)
  }

  function finishDrag(event: DragEndEvent) {
    setActiveDrag(null)
    const { source, target } = event.operation
    if (event.canceled || !source || !target) {
      setAnnouncement('Drag cancelled. Your resume is unchanged.')
      return
    }
    const block = (source.data.kind === 'library-block' ? state.blocks : state.resumeBlocks).find((item) => item.id === source.data.blockId)
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
        const block = (source?.data.kind === 'library-block' ? state.blocks : state.resumeBlocks).find((item) => item.id === source?.data.blockId)
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
        draggingFromResume={activeDrag?.fromResume ?? false}
        onManagePreset={(preset) => setEditor({ type: 'preset', preset })}
      />
      <main id="main-content" className="workspace" tabIndex={-1}>
        <header className="workspace-header">
          <h1>Resume builder</h1>
        </header>
        <StorageNotice status={saveStatus} loadIssue={loadIssue} onRetry={retrySave} onReplace={replaceSavedWorkspace} />
        <div className="builder-layout">
          <section className="canvas" aria-labelledby="resume-name">
            <div className="canvas-toolbar">
              <div className="document-title">
                <Icon name="file" size={19} />
                <div>
                  <h2 id="resume-name">{activePreset?.name ?? 'Unsaved resume'}</h2>
                  {state.modified && <span>Draft changes</span>}
                </div>
              </div>
              <span className="block-total">{selectedBlocks.length} blocks included</span>
            </div>
            <PageFitNotice fit={pageFit} compact={state.compact} />
            <div className="paper-surround">
              <ResumePreview profile={state.profile} blocks={selectedBlocks} compact={state.compact} onRemoveBlock={toggleBlock} onMoveBlock={placeBlock} activeBlock={activeDrag?.block ?? null} />
            </div>
            <p className="canvas-caption"><Icon name="grip" size={14} /> Drag handles to reorder within a section, or use the up/down buttons.</p>
          </section>
          <BuilderTools
            compact={state.compact}
            onCompactChange={(compact) => dispatch({ type: 'setCompact', compact })}
            onReset={() => { if (activePreset) setEditor({ type: 'switch-preset', target: activePreset, restore: true }) }}
            onEditProfile={() => setEditor({ type: 'profile' })}
            onCreatePreset={() => setEditor({ type: 'preset', preset: null })}
            onUpdatePreset={updatePreset}
            canUpdatePreset={!!activePreset && state.modified}
            onExport={() => setEditor({ type: 'export' })}
            canExport={selectedBlocks.length > 0 && !activeDrag}
            onTailor={() => setEditor({ type: 'tailor' })}
            canTailor={(state.blocks.length > 0 || selectedBlocks.length > 0) && !activeDrag}
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
      {editor?.type === 'export' && <ExportDialog fit={pageFit} onPrint={() => window.print()} onClose={() => setEditor(null)} />}
      {editor?.type === 'tailor' && <TailoringDialog
        blocks={[...selectedBlocks, ...state.blocks.filter((block) => !state.selectedIds.includes(block.id))]}
        currentBlocks={selectedBlocks}
        onApply={(ids) => {
          dispatch({ type: 'applyTailoring', ids })
          setEditor(null)
          setAnnouncement(`Tailored selection applied with ${ids.length} blocks. Saved presets keep their versions.`)
        }}
        onClose={() => setEditor(null)}
      />}
      {editor?.type === 'preset' && <PresetEditor
        preset={editor.preset}
        presets={state.presets}
        onSave={savePreset}
        onDelete={() => {
          if (editor.preset) {
            dispatch({ type: 'deletePreset', id: editor.preset.id })
            setAnnouncement(`${editor.preset.name} deleted. Your current draft is still available.`)
          }
          setEditor(null)
        }}
        onClose={() => setEditor(null)}
      />}
      {editor?.type === 'switch-preset' && <PresetSwitchDialog
        name={editor.target.name}
        restore={editor.restore}
        canUpdate={!!activePreset}
        onSaveAndOpen={() => openPendingPreset(true)}
        onDiscard={() => openPendingPreset(false)}
        onClose={() => setEditor(null)}
      />}
    </div>
    <PrintResume profile={state.profile} blocks={selectedBlocks} compact={state.compact} onPageFitChange={setPageFit} />
    </DragDropProvider>
  )
}
