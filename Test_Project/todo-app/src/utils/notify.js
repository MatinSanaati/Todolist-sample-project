import React from 'react'
import { createRoot } from 'react-dom/client'
import Alert from '../components/Alert'

// Simple programmatic notifier that mounts an Alert to document.body
export default function notify(message, type = 'error', options = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const cleanup = () => {
    try {
      root.unmount()
    } catch (e) {}
    if (container.parentNode) container.parentNode.removeChild(container)
  }

  root.render(
    React.createElement(Alert, {
      message,
      type,
      onClose: cleanup,
      ...options,
    }),
  )

  return { close: cleanup }
}
