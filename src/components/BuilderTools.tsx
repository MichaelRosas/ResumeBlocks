import { Icon } from './Icon'

export function BuilderTools({ compact, onCompactChange, onReset, onEditProfile }: { compact: boolean; onCompactChange: (value: boolean) => void; onReset: () => void; onEditProfile: () => void }) {
  return (
    <aside className="builder-tools" aria-label="Resume tools">
      <section className="tools-card"><span className="eyebrow">MAKE IT YOURS</span><h2>Resume tools</h2><p>A strong resume starts with the right building blocks.</p>
        <button type="button" className="edit-profile-button" onClick={onEditProfile}><Icon name="edit" size={17} /> Edit contact details</button>
        <div className="upcoming-tools"><button type="button" disabled><Icon name="sparkle" size={18} /><span>Tailor to a job</span><small>Soon</small></button><button type="button" disabled><Icon name="download" size={18} /><span>Export PDF</span><small>Soon</small></button></div>
      </section>
      <section className="tools-card layout-tools"><h2>Page layout</h2><p>Choose how much breathing room your content has.</p><div className="segmented-control" aria-label="Resume spacing"><button type="button" aria-pressed={!compact} onClick={() => onCompactChange(false)}>Standard</button><button type="button" aria-pressed={compact} onClick={() => onCompactChange(true)}>Compact</button></div><div className="page-detail"><Icon name="file" size={16} /><span>US Letter <span>8.5 × 11 in</span></span></div></section>
      <div className="tip-card"><span className="tip-icon"><Icon name="blocks" size={19} /></span><h3>Keep the experience.<br />Change the resume.</h3><p>Removing a block from your resume keeps it in your library, ready for the next opportunity.</p></div>
      <button className="reset-button" type="button" onClick={onReset}><Icon name="reset" size={15} /> Reset block selection</button>
    </aside>
  )
}
