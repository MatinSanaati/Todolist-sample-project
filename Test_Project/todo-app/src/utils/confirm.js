import React from 'react'
import { createRoot } from 'react-dom/client'
import ConfirmDialog from '../components/confirm_dialog/confirm-dialog.jsx'

export default function confirm({ title, message, confirmText, cancelText }) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const cleanup = () => {
    try { root.unmount() } catch (e) {}
    if (container.parentNode) container.parentNode.removeChild(container)
  }

  const onConfirm = () => { cleanup(); resolvePromise(true) }
  const onCancel = () => { cleanup(); resolvePromise(false) }

  let resolvePromise = () => {}
  const promise = new Promise(resolve => { resolvePromise = resolve })

  root.render(
    React.createElement(ConfirmDialog, { title, message, confirmText, cancelText, onConfirm, onCancel })
  )

  return promise
}
