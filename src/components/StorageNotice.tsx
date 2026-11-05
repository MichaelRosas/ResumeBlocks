import type { LoadIssue, SaveStatus } from '../state/workspaceStorage'

export function StorageNotice({ status, loadIssue, onRetry, onReplace }: {
  status: SaveStatus
  loadIssue: LoadIssue | null
  onRetry: () => void
  onReplace: () => void
}) {
  if (status !== 'blocked' && status !== 'error') return null

  const message = loadIssue === 'unreadable'
    ? 'Your saved workspace could not be read. The saved copy is untouched; examples are shown for now.'
    : loadIssue === 'unavailable'
      ? 'Browser storage could not be read. You can keep editing, but your changes are temporary.'
      : 'Your latest changes could not be saved. Browser storage may be full or blocked. Keep this page open and try again.'

  return (
    <section className="storage-notice" role="alert" aria-label="Workspace saving problem">
      <div>
        <strong>Changes are not being saved</strong>
        <p>{message}</p>
        {loadIssue && <p>Saving this workspace will replace any previously saved copy.</p>}
      </div>
      <button type="button" className="secondary-button" onClick={loadIssue ? onReplace : onRetry}>
        {loadIssue ? 'Save current workspace' : 'Try saving again'}
      </button>
    </section>
  )
}
