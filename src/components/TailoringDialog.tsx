import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { EditorDialog } from './EditorDialog'
import { MAX_JOB_DESCRIPTION, orderBySection, parseTailoringRequest, parseTailoringResult, sectionOrder } from '../tailoring'
import type { TailoringResult } from '../tailoring'
import { blockLabels } from '../types'
import type { ResumeBlock } from '../types'
import { copyBlock } from '../state/resumeSnapshots'

interface Props {
  blocks: ResumeBlock[]
  currentBlocks: ResumeBlock[]
  onApply: (ids: string[]) => void
  onClose: () => void
}

export function TailoringDialog({ blocks, currentBlocks, onApply, onClose }: Props) {
  const [candidates] = useState(() => blocks.map(copyBlock))
  const [current] = useState(() => orderBySection(currentBlocks.map(copyBlock)))
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<TailoringResult | null>(null)
  const [included, setIncluded] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => () => requestRef.current?.abort(), [])
  useEffect(() => { if (result) reviewHeading.current?.focus() }, [result])

  async function generate(event: FormEvent) {
    event.preventDefault()
    setError('')
    let request
    try { request = parseTailoringRequest({ jobDescription: description, blocks: candidates, selectedIds: current.map((block) => block.id) }) }
    catch (issue) { setError(issue instanceof Error ? issue.message : 'Check the job description.'); return }
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    const timeout = window.setTimeout(() => controller.abort('timeout'), 50_000)
    try {
      const response = await fetch('/api/tailor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request), signal: controller.signal,
      })
      const data: unknown = await response.json()
      if (!response.ok) {
        const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error : 'Tailoring is unavailable. Please try again.'
        throw new Error(message)
      }
      const verified = parseTailoringResult(data, candidates)
      if (requestRef.current !== controller || controller.signal.aborted) return
      setResult(verified)
      setIncluded(verified.recommendations.map((item) => item.blockId))
    } catch (issue) {
      if (requestRef.current !== controller) return
      setError(controller.signal.aborted
        ? 'Tailoring took too long. Please try again.'
        : issue instanceof Error && !(issue instanceof SyntaxError) && issue.name !== 'TypeError'
          ? issue.message : 'Could not reach tailoring. Check your connection and try again.')
    } finally {
      window.clearTimeout(timeout)
      if (requestRef.current === controller) { requestRef.current = null; setLoading(false) }
    }
  }

  function cancelRequest() {
    requestRef.current?.abort()
    requestRef.current = null
    setLoading(false)
    setError('Request cancelled. Your resume has not changed.')
  }

  const recommended = result?.recommendations.flatMap((item) => {
    const block = candidates.find((block) => block.id === item.blockId)
    return block ? [block] : []
  }) ?? []
  const choices = orderBySection([...recommended, ...candidates.filter((block) => !recommended.some((item) => item.id === block.id))])
  const proposed = choices.filter((block) => included.includes(block.id))
  const additions = proposed.filter((block) => !current.some((item) => item.id === block.id)).length
  const removals = current.filter((block) => !included.includes(block.id)).length

  return (
    <EditorDialog title="Tailor to a job" description="Choose the experience that fits this opportunity, then review every change." onClose={onClose} className={result ? 'tailoring-dialog' : ''}>
      {!result ? (
        <form onSubmit={(event) => void generate(event)}>
          <div className="editor-fields">
            <label className="form-field">Job description
              <textarea autoFocus rows={9} required maxLength={MAX_JOB_DESCRIPTION} value={description} disabled={loading} onChange={(event) => setDescription(event.target.value)} placeholder="Paste the role, responsibilities, and qualifications here…" aria-describedby="tailoring-help" />
            </label>
            <p className="field-help" id="tailoring-help">Use at least 40 characters. {description.length.toLocaleString()} / {MAX_JOB_DESCRIPTION.toLocaleString()} characters.</p>
            <p className="tailoring-privacy">Generating suggestions sends this description and {candidates.length} available blocks to OpenAI. Your contact details are excluded. Suggestions select and order existing blocks; your wording stays intact.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            {loading && <p className="tailoring-loading" role="status">Matching your blocks to this role… Your resume will stay as it is until you apply a selection.</p>}
          </div>
          <footer className="editor-footer">
            <div className="editor-footer-actions">
              <button type="button" className="secondary-button" onClick={loading ? cancelRequest : onClose}>{loading ? 'Cancel request' : 'Cancel'}</button>
              <button type="submit" className="primary-button" disabled={loading || !candidates.length}>{loading ? 'Generating…' : 'Generate suggestions'}</button>
            </div>
          </footer>
        </form>
      ) : (
        <>
          <div className="editor-fields">
            <div className="tailoring-summary">
              <h3 ref={reviewHeading} tabIndex={-1}>Review your selection</h3>
              <p>{result.summary}</p>
              <p className="field-help">AI suggestions can miss context. Check the blocks below. Only checked blocks will be included, in the order shown within each section.</p>
            </div>
            <div className="tailoring-comparison">
              <section className="tailoring-current" aria-label="Current resume blocks">
                <h3>Current resume</h3>
                <p>{current.length} blocks</p>
                <ul>{current.map((block) => <li key={block.id}><strong>{block.title}</strong><span>{included.includes(block.id) ? 'Keep' : 'Remove from draft'}</span></li>)}</ul>
                {!current.length && <p>No blocks included yet.</p>}
              </section>
              <section className="tailoring-proposed" aria-label="Proposed resume blocks">
                <h3>Proposed resume</h3>
                <p role="status">{proposed.length} blocks · {additions} added · {removals} removed</p>
                {sectionOrder.map((type) => {
                  const group = choices.filter((block) => block.type === type)
                  if (!group.length) return null
                  return <fieldset key={type} className="tailoring-section"><legend>{blockLabels[type]}</legend>{group.map((block) => {
                    const note = result.recommendations.find((item) => item.blockId === block.id)
                    const checked = included.includes(block.id)
                    const wasIncluded = current.some((item) => item.id === block.id)
                    return <div key={block.id} className={`tailoring-choice ${checked ? 'is-included' : ''}`}>
                      <label className="checkbox-field"><input type="checkbox" checked={checked} onChange={() => setIncluded((ids) => checked ? ids.filter((id) => id !== block.id) : [...ids, block.id])} /><strong>{block.title}</strong></label>
                      <span className="tailoring-badge">{note ? 'Suggested' : 'Other available block'} · {wasIncluded ? 'In current resume' : 'From library'}</span>
                      <p>{note?.reason ?? 'Not selected by AI. Include it if it adds relevant context.'}</p>
                      <details><summary>View original text</summary><p>{block.subtitle}{block.date ? ` · ${block.date}` : ''}</p><ul>{block.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul></details>
                    </div>
                  })}</fieldset>
                })}
              </section>
            </div>
            <p className="field-help">Applying changes updates your current draft. You can reorder blocks in the builder and save this version as a new preset.</p>
          </div>
          <footer className="editor-footer tailoring-footer">
            <button type="button" className="text-button" onClick={() => { setResult(null); setError('') }}>Edit job description</button>
            <div className="editor-footer-actions">
              <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
              <button type="button" className="primary-button" disabled={!proposed.length} onClick={() => onApply(proposed.map((block) => block.id))}>Apply selection</button>
            </div>
          </footer>
        </>
      )}
    </EditorDialog>
  )
}
