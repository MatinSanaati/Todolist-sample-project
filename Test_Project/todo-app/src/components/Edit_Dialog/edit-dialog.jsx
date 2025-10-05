import React, { useState, useEffect, useRef } from 'react'
import './edit-dialog.css'

export default function EditDialog({ title = 'ویرایش تسک', initial = {}, onConfirm, onCancel, confirmText = 'ذخیره', cancelText = 'انصراف' }) {
  const [t, setT] = useState(initial.title || '')
  const [d, setD] = useState(initial.description || '')
  const inputRef = useRef(null)

  useEffect(() => { if (inputRef.current) inputRef.current.focus() }, [])

  return (
    <div className="ed-root">
      <div className="ed-backdrop" />
      <div className="ed-card" role="dialog" aria-modal="true">
        <h3 className="ed-title">{title}</h3>
        <div className="ed-body">
          <input ref={inputRef} value={t} onChange={e => setT(e.target.value)} placeholder="عنوان" />
          <textarea value={d} onChange={e => setD(e.target.value)} placeholder="توضیحات (اختیاری)" />
        </div>
        <div className="ed-actions">
          <button className="ed-cancel" onClick={() => onCancel && onCancel()}>{cancelText}</button>
          <button className="ed-confirm" onClick={() => onConfirm && onConfirm({ title: t, description: d })}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
