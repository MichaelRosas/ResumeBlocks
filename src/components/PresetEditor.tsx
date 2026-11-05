import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ResumePreset } from '../types'
import { isPresetNameAvailable } from '../state/resumeSnapshots'
import { EditorDialog } from './EditorDialog'

export function PresetEditor({ preset, presets, onSave, onDelete, onClose }: {
  preset: ResumePreset | null
  presets: ResumePreset[]
  onSave: (name: string, description: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(preset?.name ?? '')
  const [description, setDescription] = useState(preset?.description ?? '')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirmDelete) return
    if (!isPresetNameAvailable(presets, name, preset?.id)) {
      setError(name.trim() ? 'A preset with this name already exists. Choose another name.' : 'Enter a name for this preset.')
      event.currentTarget.querySelector<HTMLInputElement>('[name="presetName"]')?.focus()
      return
    }
    onSave(name.trim(), description.trim())
  }

  return (
    <EditorDialog title={preset ? 'Manage preset' : 'Save as new preset'} description={preset ? 'Rename this saved version or remove it from your presets.' : 'Save a separate copy of the current content, contact details, order, and spacing.'} onClose={onClose}>
      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-fields">
          <label className="form-field">
            Preset name <span className="field-required">(required)</span>
            <input autoFocus name="presetName" required maxLength={80} placeholder="e.g. Acme — Front-end internship" value={name} onChange={(event) => { setName(event.target.value); setError('') }} />
          </label>
          <label className="form-field">
            Description (optional)
            <input maxLength={160} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {confirmDelete && <div className="delete-confirmation" role="alert">
            <strong>Delete “{preset?.name}”?</strong>
            <p>This deletes the saved preset. Your current resume and block library will remain available.</p>
            <div className="confirmation-actions">
              <button type="button" className="secondary-button" onClick={() => setConfirmDelete(false)}>Keep preset</button>
              <button type="button" className="danger-button" onClick={onDelete}>Delete preset permanently</button>
            </div>
          </div>}
        </div>
        <footer className="editor-footer">
          {preset && !confirmDelete && <button type="button" className="delete-button" onClick={() => setConfirmDelete(true)}>Delete preset</button>}
          <div className="editor-footer-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            {!confirmDelete && <button type="submit" className="primary-button">{preset ? 'Save preset details' : 'Save new preset'}</button>}
          </div>
        </footer>
      </form>
    </EditorDialog>
  )
}
