import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ResumeProfile } from '../types'
import { EditorDialog } from './EditorDialog'

export function ProfileEditor({ profile, onSave, onClose }: {
  profile: ResumeProfile
  onSave: (profile: ResumeProfile) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState({ ...profile })
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim()) {
      setError('Enter your name.')
      event.currentTarget.querySelector<HTMLInputElement>('[name="name"]')?.focus()
      return
    }
    onSave({
      name: draft.name.trim(),
      headline: draft.headline.trim(),
      email: draft.email.trim(),
      location: draft.location.trim(),
      website: draft.website.trim(),
    })
  }

  return (
    <EditorDialog title="Edit contact details" description="Your name and contact details appear at the top of your resume." onClose={onClose}>
      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-fields">
          <label className="form-field">
            Full name <span className="field-required">(required)</span>
            <input autoFocus name="name" autoComplete="name" value={draft.name} maxLength={100} required onChange={(event) => { setDraft({ ...draft, name: event.target.value }); setError('') }} />
          </label>
          <label className="form-field">
            Headline (optional)
            <input value={draft.headline} maxLength={150} placeholder="e.g. Computer Science Student" onChange={(event) => setDraft({ ...draft, headline: event.target.value })} />
          </label>
          <label className="form-field">
            Email (optional)
            <input type="email" autoComplete="email" value={draft.email} maxLength={254} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label className="form-field">
            Location (optional)
            <input autoComplete="address-level2" value={draft.location} maxLength={100} placeholder="e.g. Chicago, IL" onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
          <label className="form-field">
            Website or portfolio (optional)
            <input value={draft.website} maxLength={200} placeholder="e.g. github.com/yourname" onChange={(event) => setDraft({ ...draft, website: event.target.value })} />
          </label>
          {error && <p role="alert" className="form-error">{error}</p>}
        </div>
        <footer className="editor-footer">
          <div className="editor-footer-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save contact details</button>
          </div>
        </footer>
      </form>
    </EditorDialog>
  )
}
