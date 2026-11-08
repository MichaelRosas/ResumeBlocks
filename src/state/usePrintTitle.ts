import { useEffect } from 'react'

export function usePrintTitle(name: string) {
  useEffect(() => {
    let previousTitle: string | null = null
    const restoreTitle = () => {
      if (previousTitle !== null) document.title = previousTitle
      previousTitle = null
    }
    const prepareTitle = () => {
      if (previousTitle === null) previousTitle = document.title
      document.title = name.replace(/[\\/:*?"<>|]/g, '-').trim() || 'Resume'
    }
    window.addEventListener('beforeprint', prepareTitle)
    window.addEventListener('afterprint', restoreTitle)
    return () => {
      window.removeEventListener('beforeprint', prepareTitle)
      window.removeEventListener('afterprint', restoreTitle)
      restoreTitle()
    }
  }, [name])
}
