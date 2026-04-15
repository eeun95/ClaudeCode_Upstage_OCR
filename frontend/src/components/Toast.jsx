import { useEffect } from 'react'

const STYLES = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-slide-up z-50 ${STYLES[type]}`}
    >
      <span>{ICONS[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-75 hover:opacity-100 text-xs">
        ✕
      </button>
    </div>
  )
}
