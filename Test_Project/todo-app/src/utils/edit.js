import React from 'react'
import { createRoot } from 'react-dom/client'
import EditDialog from '../components/EditDialog'

export default function editTask(initial = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const cleanup = () => {
    try { root.unmount() } catch (e) {}
    if (container.parentNode) container.parentNode.removeChild(container)
  }

  let resolvePromise = () => {}
  const promise = new Promise(resolve => { resolvePromise = resolve })

  const onConfirm = (data) => { cleanup(); resolvePromise(data) }
  const onCancel = () => { cleanup(); resolvePromise(null) }

  root.render(React.createElement(EditDialog, { initial, onConfirm, onCancel }))

  return promise
}
