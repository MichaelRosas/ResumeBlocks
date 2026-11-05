import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BlockType, ResumeBlock } from '../types'
import { EditorDialog } from './EditorDialog'
import { Icon } from './Icon'

interface BlockEditorProps {
  block: ResumeBlock | null
  included: boolean
  onSave: (block: ResumeBlock, includeInResume: boolean) => void
  onDelete: (block: ResumeBlock) => void
  onClose: () => void
}

const fieldLabels: Record<BlockType, { title: string; subtitle: string }> = {
  education: { title: 'Degree or qualification', subtitle: 'School or institution' },
  experience: { title: 'Role or position', subtitle: 'Company and location' },
  project: { title: 'Project name', subtitle: 'Technologies or short description' },
  skills: { title: 'Skills heading', subtitle: 'Library description (optional)' },
}

export function BlockEditor({ block, included, onSave, onDelete, onClose }: BlockEditorProps) {
  const [type, setType] = useState<BlockType>(block?.type ?? 'project')
  const [title, setTitle] = useState(block?.title ?? '')
  const [subtitle, setSubtitle] = useState(block?.subtitle ?? '')
  const [date, setDate] = useState(block?.date ?? '')
  const [bullets, setBullets] = useState(() => (block?.bullets.length ? block.bullets : [''])
    .map((text) => ({ id: crypto.randomUUID(), text })))
  const [includeInResume, setIncludeInResume] = useState(included)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const labels = fieldLabels[type]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirmDelete) return
    if (!title.trim()) {
      setError('Enter a title for this block.')
      event.currentTarget.querySelector<HTMLInputElement>('[name="title"]')?.focus()
      return
    }
    onSave({
      id: block?.id ?? crypto.randomUUID(),
      type,
      title: title.trim(),
      subtitle: subtitle.trim(),
      date: type === 'skills' ? undefined : date.trim() || undefined,
      bullets: bullets.map((bullet) => bullet.text.trim()).filter(Boolean),
    }, includeInResume)
  }

  return (
    <EditorDialog
      title={block ? 'Edit block' : 'Create a block'}
      description="Keep reusable content in your library and choose what appears on your resume."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="editor-fields">
          <label className="form-field">
            Block type
            <select value={type} onChange={(event) => setType(event.target.value as BlockType)}>
              <option value="education">Education</option>
              <option value="experience">Experience</option>
              <option value="project">Project</option>
              <option value="skills">Skills</option>
            </select>
          </label>
          <label className="form-field">
            {labels.title} <span className="field-required">(required)</span>
            <input autoFocus name="title" value={title} required maxLength={150} onChange={(event) => { setTitle(event.target.value); setError('') }} />
          </label>
          <label className="form-field">
            {labels.subtitle}
            <input value={subtitle} maxLength={200} onChange={(event) => setSubtitle(event.target.value)} />
          </label>
          {type !== 'skills' && (
            <label className="form-field">
              Dates (optional)
              <input value={date} maxLength={100} placeholder="e.g. May – Aug 2026" onChange={(event) => setDate(event.target.value)} />
            </label>
          )}

          <fieldset className="bullet-fields">
            <legend>{type === 'skills' ? 'Skill lines' : 'Bullet points'}</legend>
            <p className="field-help">{type === 'skills' ? 'Use a line for each group, such as Languages or Tools.' : 'Describe what you did, built, or learned. Blank bullet points are omitted.'}</p>
            {bullets.map((bullet, index) => (
              <div className="bullet-field" key={bullet.id}>
                <label className="form-field">
                  {type === 'skills' ? 'Skill line' : 'Bullet'} {index + 1}
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={bullet.text}
                    onChange={(event) => setBullets((current) => current.map((item) => item.id === bullet.id ? { ...item, text: event.target.value } : item))}
                  />
                </label>
                <button
                  type="button"
                  className="icon-button bullet-remove"
                  aria-label={`Remove ${type === 'skills' ? 'skill line' : 'bullet'} ${index + 1}`}
                  onClick={() => setBullets((current) => current.filter((item) => item.id !== bullet.id))}
                ><Icon name="close" size={17} /></button>
              </div>
            ))}
            <button
              type="button"
              className="text-button"
              onClick={() => setBullets((current) => [...current, { id: crypto.randomUUID(), text: '' }])}
            ><Icon name="plus" size={16} /> {type === 'skills' ? 'Add skill line' : 'Add bullet point'}</button>
          </fieldset>

          <label className="checkbox-field">
            <input type="checkbox" checked={includeInResume} onChange={(event) => setIncludeInResume(event.target.checked)} />
            Include this block in the current resume
          </label>
          {error && <p role="alert" className="form-error">{error}</p>}

          {confirmDelete && block && (
            <div className="delete-confirmation" role="alert">
              <strong>Delete “{block.title}” from your library?</strong>
              <p>This removes it from every resume selection. You cannot undo this.</p>
              <div className="confirmation-actions">
                <button type="button" className="secondary-button" onClick={() => setConfirmDelete(false)}>Keep block</button>
                <button type="button" className="danger-button" onClick={() => onDelete(block)}>Delete permanently</button>
              </div>
            </div>
          )}
        </div>

        <footer className="editor-footer">
          {block && !confirmDelete && <button type="button" className="delete-button" onClick={() => setConfirmDelete(true)}>Delete block</button>}
          <div className="editor-footer-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            {!confirmDelete && <button type="submit" className="primary-button">{block ? 'Save changes' : 'Create block'}</button>}
          </div>
        </footer>
      </form>
    </EditorDialog>
  )
}
