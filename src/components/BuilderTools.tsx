import { Icon } from './Icon'
import { FormattingPanel } from './FormattingPanel'
import type { ResumeFormatting } from '../types'

export function BuilderTools({ formatting, onFormattingChange, onReset, onEditProfile, onCreatePreset, onUpdatePreset, canUpdatePreset, onExport, canExport, onTailor, canTailor }: { formatting: ResumeFormatting; onFormattingChange: (formatting: ResumeFormatting) => void; onReset: () => void; onEditProfile: () => void; onCreatePreset: () => void; onUpdatePreset: () => void; canUpdatePreset: boolean; onExport: () => void; canExport: boolean; onTailor: () => void; canTailor: boolean }) {
  return (
    <aside className="builder-tools" aria-label="Resume tools">
      <section className="tools-card preset-tools">
        <h2>Save your resume</h2>
        <button type="button" className="primary-button" onClick={onCreatePreset}><Icon name="plus" size={16} /> Save as new</button>
        <button type="button" className="secondary-button" disabled={!canUpdatePreset} onClick={onUpdatePreset}>Update preset</button>
        <p className="preset-save-help">Draft changes save automatically. Update a preset to replace its saved version.</p>
      </section>
      <section className="tools-card"><h2>Resume tools</h2>
        <button type="button" className="edit-profile-button" onClick={onEditProfile}><Icon name="edit" size={17} /> Edit contact details</button>
        <button type="button" className="export-pdf-button" disabled={!canExport} onClick={onExport}><Icon name="download" size={18} /> Export PDF</button>
        <button type="button" className="tailor-button" disabled={!canTailor} onClick={onTailor}><Icon name="sparkle" size={18} /> Tailor to a job</button>
      </section>
      <FormattingPanel formatting={formatting} onChange={onFormattingChange} />
      <button className="reset-button" type="button" disabled={!canUpdatePreset} onClick={onReset}><Icon name="reset" size={15} /> Restore saved preset</button>
    </aside>
  )
}
