import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface EditorDialogProps {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  className?: string
}

export function EditorDialog({ title, description, onClose, children, className = '' }: EditorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current!
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()

    return () => {
      dialog.close()
      // Deleting a block can remove the button that originally opened the editor.
      const target = previousFocus?.isConnected
        ? previousFocus
        : document.querySelector<HTMLElement>('[data-editor-fallback]')
      target?.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`editor-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
    >
      <header className="editor-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close editor">
          <Icon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  )
}
