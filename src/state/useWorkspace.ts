import { useCallback, useEffect, useReducer, useState } from 'react'
import { builderReducer } from './builder'
import type { BuilderState } from './builder'
import { loadWorkspace, saveWorkspace } from './workspaceStorage'
import type { SaveStatus } from './workspaceStorage'

export function useWorkspace() {
  const [initial] = useState(loadWorkspace)
  const [state, dispatch] = useReducer(builderReducer, initial.state)
  const [loadIssue, setLoadIssue] = useState(initial.issue)
  const [lastSavedState, setLastSavedState] = useState<BuilderState | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)

  const retrySave = useCallback(() => {
    if (loadIssue) return
    if (saveWorkspace(state)) {
      setLastSavedState(state)
      setSaveFailed(false)
    } else {
      setSaveFailed(true)
    }
  }, [state, loadIssue])

  useEffect(() => { retrySave() }, [retrySave])

  function replaceSavedWorkspace() {
    // Only the recovery action permits overwriting data that failed to load.
    if (window.confirm('Save the current workspace in this browser? This replaces any previously saved workspace, including data that could not be loaded.')) {
      setLoadIssue(null)
    }
  }

  const saveStatus: SaveStatus = loadIssue ? 'blocked'
    : saveFailed ? 'error'
      : lastSavedState === state ? 'saved' : 'saving'

  return { state, dispatch, saveStatus, loadIssue, retrySave, replaceSavedWorkspace }
}
