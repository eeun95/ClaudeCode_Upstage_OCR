import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import DropZone from '../components/DropZone'
import Header from '../components/Header'
import ParsePreview from '../components/ParsePreview'
import ProgressBar from '../components/ProgressBar'
import Toast from '../components/Toast'

export default function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed]   = useState(null)
  const [error, setError]     = useState(null)
  const [toast, setToast]     = useState(null)

  async function handleFile(file) {
    setLoading(true)
    setError(null)
    setParsed(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setParsed(data)
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'OCR 파싱에 실패했습니다. 다시 시도해 주세요.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(form) {
    try {
      // 수정된 내용을 백엔드에 반영
      const { data } = await api.put(`/api/expenses/${form.id}`, form)

      // localStorage 병행 저장 (Vercel 무상태 대응)
      const stored = JSON.parse(localStorage.getItem('expenses') || '[]')
      const idx = stored.findIndex((e) => e.id === data.id)
      if (idx >= 0) stored[idx] = data
      else stored.push(data)
      localStorage.setItem('expenses', JSON.stringify(stored))

      setToast({ message: '지출이 저장되었습니다!', type: 'success' })
      setTimeout(() => navigate('/'), 1200)
    } catch {
      setToast({ message: '저장에 실패했습니다. 다시 시도해 주세요.', type: 'error' })
    }
  }

  function handleCancel() {
    setParsed(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">영수증 업로드</h1>

        {/* 업로드 영역: 파싱 결과가 없을 때만 표시 */}
        {!parsed && (
          <DropZone onFile={handleFile} disabled={loading} />
        )}

        {/* 진행 표시 */}
        <ProgressBar visible={loading} />

        {/* 오류 배너 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm font-semibold text-red-600 hover:underline ml-4 shrink-0"
            >
              재시도
            </button>
          </div>
        )}

        {/* 파싱 결과 미리보기 */}
        {parsed && (
          <ParsePreview
            data={parsed}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
