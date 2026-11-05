import { EditorDialog } from './EditorDialog'

export function PresetSwitchDialog({ name, restore, canUpdate, onSaveAndOpen, onDiscard, onClose }: {
  name: string
  restore: boolean
  canUpdate: boolean
  onSaveAndOpen: () => void
  onDiscard: () => void
  onClose: () => void
}) {
  return (
    <EditorDialog title={restore ? 'Restore saved preset?' : 'Open another preset?'} description={`Your current resume has changes that are not in a named preset. Opening “${name}” will replace the current draft.`} onClose={onClose}>
      <div className="editor-fields"><p className="field-help">Your reusable block library stays available. You can cancel and use Save as new to keep a separate version.</p></div>
      <footer className="editor-footer preset-switch-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
        <button type="button" className="secondary-button" onClick={onDiscard}>{restore ? 'Restore preset' : 'Open without saving'}</button>
        {!restore && canUpdate && <button type="button" className="primary-button" onClick={onSaveAndOpen}>Update current & open</button>}
      </footer>
    </EditorDialog>
  )
}
