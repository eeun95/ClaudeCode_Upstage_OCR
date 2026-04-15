import { useRef, useState } from 'react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

export default function DropZone({ onFile, disabled }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function validate(file) {
    if (!file) return null
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('JPG, PNG, PDF 파일만 업로드할 수 있습니다.')
      return null
    }
    if (file.size > MAX_SIZE) {
      alert('파일 크기가 10MB를 초과합니다.')
      return null
    }
    return file
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = validate(e.dataTransfer.files[0])
    if (file) onFile(file)
  }

  function handleChange(e) {
    const file = validate(e.target.files[0])
    if (file) onFile(file)
    e.target.value = ''
  }

  const zoneClass = disabled
    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
    : dragOver
      ? 'border-indigo-500 bg-indigo-50'
      : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={disabled ? undefined : handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200 ${zoneClass}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="text-5xl mb-4 select-none">📄</div>
      <p className="text-base font-semibold text-gray-700">
        영수증을 드래그하거나 클릭해서 업로드
      </p>
      <p className="text-sm text-gray-500 mt-2">JPG · PNG · PDF &nbsp;|&nbsp; 최대 10MB</p>
    </div>
  )
}
