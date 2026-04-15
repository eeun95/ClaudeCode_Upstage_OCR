import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ExpenseDetail from './pages/ExpenseDetail'
import UploadPage from './pages/UploadPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/expense/:id" element={<ExpenseDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
