import type { ResumeFormatting } from '../types'
import { fontChoices, fontSizes, lineSpacings, pageMargins, sameFormatting, sectionSpacings, standardFormatting } from '../formatting'

export function FormattingPanel({ formatting, onChange }: { formatting: ResumeFormatting; onChange: (formatting: ResumeFormatting) => void }) {
  function change<K extends keyof ResumeFormatting>(key: K, value: ResumeFormatting[K]) {
    onChange({ ...formatting, [key]: value })
  }
  return (
    <section className="tools-card formatting-panel" aria-labelledby="formatting-heading">
      <h2 id="formatting-heading">Formatting</h2>
      <div className="formatting-fields">
        <label className="form-field">Font
          <select style={{ fontFamily: fontChoices[formatting.font].family }} value={formatting.font} onChange={(event) => change('font', event.target.value as ResumeFormatting['font'])}>
            {Object.entries(fontChoices).map(([value, option]) => <option key={value} value={value} style={{ fontFamily: option.family }}>{option.label}</option>)}
          </select>
        </label>
        <label className="form-field">Text size
          <select value={formatting.fontSize} onChange={(event) => change('fontSize', Number(event.target.value))}>
            {fontSizes.map((size) => <option key={size} value={size}>{size} pt</option>)}
          </select>
        </label>
        <label className="form-field">Line spacing
          <select value={formatting.lineSpacing} onChange={(event) => change('lineSpacing', Number(event.target.value))}>
            {lineSpacings.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="form-field">Section spacing
          <select value={formatting.sectionSpacing} onChange={(event) => change('sectionSpacing', Number(event.target.value))}>
            {sectionSpacings.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="form-field">Page margins
          <select value={formatting.pageMargin} onChange={(event) => change('pageMargin', Number(event.target.value))}>
            {pageMargins.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="form-field">Header alignment
          <select value={formatting.headerAlignment} onChange={(event) => change('headerAlignment', event.target.value as ResumeFormatting['headerAlignment'])}>
            <option value="left">Left</option><option value="center">Centered</option>
          </select>
        </label>
      </div>
      <button type="button" className="reset-formatting-button" disabled={sameFormatting(formatting, standardFormatting)} onClick={() => onChange({ ...standardFormatting })}>Reset formatting</button>
    </section>
  )
}
