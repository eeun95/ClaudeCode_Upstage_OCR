import { useState } from 'react'
import Badge from './Badge'

const CATEGORIES = ['식료품', '외식', '교통', '쇼핑', '의료', '기타']

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'focus:border-transparent transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

export default function ParsePreview({ data, onSave, onCancel }) {
  const [form, setForm] = useState(data)

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setItem(idx, key, value) {
    const items = [...form.items]
    items[idx] = { ...items[idx], [key]: key === 'name' ? value : Number(value) }
    setForm((prev) => ({ ...prev, items }))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">파싱 결과 확인</h2>
        <Badge category={form.category} />
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>가게명</label>
          <input
            className={inputCls}
            value={form.store_name || ''}
            onChange={(e) => set('store_name', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>카테고리</label>
          <select
            className={inputCls}
            value={form.category || '기타'}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>날짜</label>
          <input
            className={inputCls}
            type="date"
            value={form.receipt_date || ''}
            onChange={(e) => set('receipt_date', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>시각</label>
          <input
            className={inputCls}
            type="time"
            value={form.receipt_time || ''}
            onChange={(e) => set('receipt_time', e.target.value)}
          />
        </div>
      </div>

      {/* 품목 목록 */}
      {form.items?.length > 0 && (
        <div>
          <label className={labelCls}>품목 목록</label>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
              <span className="col-span-5">품목명</span>
              <span className="col-span-2 text-right">수량</span>
              <span className="col-span-2 text-right">단가</span>
              <span className="col-span-3 text-right">합계</span>
            </div>
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <input
                  className={`${inputCls} col-span-5`}
                  value={item.name}
                  onChange={(e) => setItem(idx, 'name', e.target.value)}
                />
                <input
                  className={`${inputCls} col-span-2 text-right`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                />
                <input
                  className={`${inputCls} col-span-2 text-right`}
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => setItem(idx, 'unit_price', e.target.value)}
                />
                <input
                  className={`${inputCls} col-span-3 text-right`}
                  type="number"
                  value={item.total_price}
                  onChange={(e) => setItem(idx, 'total_price', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 금액 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>소계</label>
          <input
            className={inputCls}
            type="number"
            value={form.subtotal || 0}
            onChange={(e) => set('subtotal', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>할인</label>
          <input
            className={inputCls}
            type="number"
            value={form.discount || 0}
            onChange={(e) => set('discount', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>세금</label>
          <input
            className={inputCls}
            type="number"
            value={form.tax || 0}
            onChange={(e) => set('tax', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelCls}>결제 수단</label>
          <input
            className={inputCls}
            value={form.payment_method || ''}
            onChange={(e) => set('payment_method', e.target.value)}
          />
        </div>
      </div>

      {/* 총 결제 금액 */}
      <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">총 결제 금액</span>
        <div className="flex items-center gap-2">
          <input
            className="w-36 px-3 py-1 border border-indigo-200 rounded-lg text-xl font-bold text-indigo-600 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            type="number"
            value={form.total_amount || 0}
            onChange={(e) => set('total_amount', Number(e.target.value))}
          />
          <span className="text-sm text-gray-500">원</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onSave(form)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
