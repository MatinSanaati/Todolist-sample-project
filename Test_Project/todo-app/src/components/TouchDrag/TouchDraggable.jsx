import React, { useRef, useEffect } from 'react'
import './touch-drag.css'

// TouchDraggable: wraps a child (task card) and enables touch-based drag-and-drop.
// Props:
// - task: task object with id
// - index: position index in source column
// - columnId: source column id
// - onTouchDrop: (taskId, toColumnId, toIndex) => void
export default function TouchDraggable({ task, index, columnId, onTouchDrop, children }) {
  const nodeRef = useRef(null)
  const ghostRef = useRef(null)
  const lastTargetRef = useRef({ col: null, idx: null })

  useEffect(() => {
    const el = nodeRef.current
    if (!el) return

    let startX = 0, startY = 0, moving = false, touchId = null

    const onTouchStart = e => {
      const t = e.changedTouches[0]
      touchId = t.identifier
      startX = t.clientX; startY = t.clientY
      moving = false
    }

    const createGhost = (touch) => {
      const rect = el.getBoundingClientRect()
      const g = el.cloneNode(true)
      g.classList.add('td-ghost')
      g.style.position = 'fixed'
      g.style.left = `${touch.clientX - rect.width/2}px`
      g.style.top = `${touch.clientY - rect.height/2}px`
      g.style.width = `${rect.width}px`
      g.style.pointerEvents = 'none'
      document.body.appendChild(g)
      ghostRef.current = g
      requestAnimationFrame(() => g.classList.add('td-ghost--visible'))
    }

    const moveGhost = (touch) => {
      const g = ghostRef.current
      if (!g) return
      g.style.left = `${touch.clientX - g.offsetWidth/2}px`
      g.style.top = `${touch.clientY - g.offsetHeight/2}px`
    }

    const removeGhost = () => {
      const g = ghostRef.current
      if (!g) return
      try { g.classList.remove('td-ghost--visible') } catch(e){}
      setTimeout(() => { if (g.parentNode) g.parentNode.removeChild(g) }, 220)
      ghostRef.current = null
    }

    const findDropTarget = (touch) => {
      const p = document.elementFromPoint(touch.clientX, touch.clientY)
      if (!p) return { col: null, idx: null }
      const colEl = p.closest('.column')
      if (!colEl) return { col: null, idx: null }
      const colId = colEl.querySelector('.column-header h2')?.textContent || colEl.getAttribute('data-column-id')
      // prefer data attribute if present
      const dataCol = colEl.getAttribute('data-column-id')
      const finalColId = dataCol || (colId ? colId.trim() : null)

      // find task-list and compute index
      const list = colEl.querySelector('.task-list')
      if (!list) return { col: finalColId, idx: 0 }
      const children = Array.from(list.children)
      for (let i = 0; i < children.length; i++) {
        const ch = children[i]
        const r = ch.getBoundingClientRect()
        if (touch.clientY < r.top + r.height / 2) return { col: finalColId, idx: i }
      }
      return { col: finalColId, idx: children.length }
    }

    const onTouchMove = e => {
      const touches = e.changedTouches
      let t = null
      for (let i = 0; i < touches.length; i++) if (touches[i].identifier === touchId) { t = touches[i]; break }
      if (!t) return
      const dx = Math.abs(t.clientX - startX)
      const dy = Math.abs(t.clientY - startY)
      const moved = dx + dy > 8
      if (moved && !moving) {
        moving = true
        createGhost(t)
        // small haptic feedback if available
        try { navigator.vibrate && navigator.vibrate(10) } catch (e) {}
      }
      if (moving) {
        e.preventDefault()
        moveGhost(t)
        const target = findDropTarget(t)
        // record last target (to use on touchend)
        lastTargetRef.current = target
        // optional: show insert indicator by adding a class to the column (not required here)
      }
    }

    const onTouchEnd = e => {
      const touches = e.changedTouches
      let t = null
      for (let i = 0; i < touches.length; i++) if (touches[i].identifier === touchId) { t = touches[i]; break }
      if (!t) return
      if (moving) {
        const target = lastTargetRef.current || findDropTarget(t)
        if (target && target.col) {
          // call onTouchDrop with computed column id and index
          try { onTouchDrop && onTouchDrop(task.id, target.col, target.idx) } catch (e) {}
        }
      }
      removeGhost()
      moving = false
      touchId = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      removeGhost()
    }
  }, [task, index, columnId, onTouchDrop])

  return (
    <div ref={nodeRef} className="td-touch-wrapper">
      {children}
    </div>
  )
}
