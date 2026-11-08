import { EditorDialog } from './EditorDialog'
import type { PageFit } from './PrintResume'

export function ExportDialog({ fit, onPrint, onClose }: { fit: PageFit; onPrint: () => void; onClose: () => void }) {
  return (
    <EditorDialog title="Export resume as PDF" description="Your browser’s print dialog lets you save the current resume as a PDF." onClose={onClose}>
      <div className="editor-fields">
        <p className={`export-fit ${fit === 'overflow' ? 'is-overflow' : ''}`}>
          {fit === 'overflow' ? 'This resume exceeds one page. All content will be included across additional pages.' : fit === 'fits' ? 'This resume fits one US Letter page with the settings below.' : 'Review the final page count in the print preview.'}
        </p>
        <ol className="print-instructions">
          <li>Choose <strong>Save as PDF</strong> as the destination.</li>
          <li>Use <strong>Letter</strong> paper, <strong>100%</strong> scale, and the default <strong>0.5-inch</strong> margins.</li>
          <li>Turn off <strong>Headers and footers</strong>, then review the page count and save.</li>
        </ol>
        <p className="field-help">The export includes your current draft. You can update a named preset separately if you want to keep this version.</p>
      </div>
      <footer className="editor-footer">
        <div className="editor-footer-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-button" onClick={onPrint}>Print / Save as PDF</button>
        </div>
      </footer>
    </EditorDialog>
  )
}
