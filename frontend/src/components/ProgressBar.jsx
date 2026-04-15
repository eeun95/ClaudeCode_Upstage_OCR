import { useEffect, useState } from 'react'

export default function ProgressBar({ visible }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) {
      setProgress(0)
      return
    }
    setProgress(10)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) { clearInterval(interval); return 85 }
        return Math.min(85, prev + Math.random() * 10)
      })
    }, 400)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-blue-600 font-medium">OCR 파싱 중입니다...</p>
        <p className="text-xs text-gray-500">{Math.round(progress)}%</p>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
