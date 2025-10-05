import React from 'react'
import './confirm-dialog.css';

export default function ConfirmDialog({ title = 'هشدار', message = '', onConfirm, onCancel, confirmText = 'حذف', cancelText = 'انصراف' }) {
    return (
        <div className="cd-root">
            <div className="cd-backdrop" />
            <div className="cd-card" role="dialog" aria-modal="true">
                <h3 className="cd-title">{title}</h3>
                <p className="cd-message">{message}</p>
                <div className="cd-actions">
                    <button className="cd-btn-cancel" onClick={onCancel}>{cancelText}</button>
                    <button className="cd-btn-confirm" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    )
}
