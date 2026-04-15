import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-indigo-600 tracking-tight">
          Receipt Tracker
        </Link>
        <button
          onClick={() => navigate('/upload')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          + 영수증 추가
        </button>
      </div>
    </header>
  )
}
