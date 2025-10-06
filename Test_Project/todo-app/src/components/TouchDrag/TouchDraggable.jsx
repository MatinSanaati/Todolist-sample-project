import React, { useRef, useEffect } from 'react'
import './touch-drag.css'

export default function TouchDraggable({ task, index, columnId, onTouchDrop, children }) {
  const nodeRef = useRef(null)
  const ghostRef = useRef(null)
  const lastTargetRef = useRef({ col: null, idx: null })

  useEffect(() => {
    const el = nodeRef.current
    if (!el) return

    let startX = 0, startY = 0, moving = false, touchId = null
    let longPress = false, pressTimer = null, cancelledByScroll = false

    const onTouchStart = e => {
      const t = e.changedTouches[0]
      touchId = t.identifier
      startX = t.clientX; startY = t.clientY
      moving = false
      cancelledByScroll = false
      longPress = false

      // set up long-press gate (600ms)
      if (pressTimer) clearTimeout(pressTimer)
      pressTimer = setTimeout(() => {
        longPress = true
        // subtle feedback
        try { navigator.vibrate && navigator.vibrate(8) } catch (e) {}
        el.classList.add('td-pressing')
      }, 600)
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

      // If user scrolls before long press -> cancel drag attempt
      if (!longPress && moved) {
        cancelledByScroll = true
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
        return // allow native scroll; do not preventDefault
      }

      // Only allow entering drag after long-press gate
      if (longPress && moved && !moving) {
        moving = true
        createGhost(t)
        el.classList.add('td-dragging')
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
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
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
      longPress = false
      cancelledByScroll = false
      try { el.classList.remove('td-dragging'); el.classList.remove('td-pressing') } catch (e) {}
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
      if (pressTimer) clearTimeout(pressTimer)
    }
  }, [task, index, columnId, onTouchDrop])

  return (
    <div ref={nodeRef} className="td-touch-wrapper">
      {children}
    </div>
  )
}
