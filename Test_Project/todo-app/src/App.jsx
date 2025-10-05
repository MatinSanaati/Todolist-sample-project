import React, { useEffect, useState } from 'react'
import './App.css'
import Column from './components/Column/column.jsx'

const COLUMNS = [
  { id: 'todo', title: 'برای انجام' },
  { id: 'inprogress', title: 'در حال انجام' },
  { id: 'done', title: 'انجام شد' },
]

const STORAGE_KEY = 'kanban.tasks.v1'

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (e) {
      // ignore
    }
  }, [tasks])

  const addTask = (title, description) => {
    if (!title) return
    const id = Date.now().toString()
    const createdAt = new Date().toISOString()
    const newTask = { id, title: title.trim(), description: (description || '').trim(), createdAt, isNew: true }

    // duplicate detection across all tasks: match both title and description (case-insensitive)
    const normalize = s => (s || '').trim().toLowerCase()
    const tNorm = normalize(newTask.title)
    const dNorm = normalize(newTask.description)
    const existing = Object.values(tasks || {}).find(t => normalize(t.title) === tNorm && normalize(t.description) === dNorm)
    if (existing) {
      return { ok: false, reason: 'duplicate', existingId: existing.id }
    }

    setTasks(prev => {
      // compute next order for todo column
      const values = Object.values(prev || {})
      const todoItems = values.filter(t => t.column === 'todo').sort((a, b) => (a.order || 0) - (b.order || 0))
      const nextOrder = (todoItems.length ? (todoItems[todoItems.length - 1].order || todoItems.length - 1) + 1 : 0)
      return { ...prev, [id]: { ...newTask, column: 'todo', order: nextOrder } }
    })
    return { ok: true, id }
  }

  const updateTask = (id, patch) => {
    setTasks(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const deleteTask = id => {
    setTasks(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const moveTask = (id, toColumn, toIndex = null) => {
    setTasks(prev => {
      const copy = { ...prev }
      if (!copy[id]) return prev

      // build arrays per column with stable ordering
      const all = Object.values(copy).map(t => ({ ...t }))
      const groups = {}
      all.forEach(t => {
        const col = t.column || 'todo'
        if (!groups[col]) groups[col] = []
        groups[col].push(t)
      })
      Object.keys(groups).forEach(col => groups[col].sort((a, b) => (a.order || 0) - (b.order || 0)))

      const task = copy[id]
      const fromCol = task.column || 'todo'

      // remove from source group
      groups[fromCol] = (groups[fromCol] || []).filter(t => t.id !== id)

      // ensure target group exists
      if (!groups[toColumn]) groups[toColumn] = []

      // determine insert index
      let index = toIndex
      if (index == null || index < 0 || index > groups[toColumn].length) index = groups[toColumn].length

      // insert into target
      const moved = { ...task, column: toColumn }
      groups[toColumn].splice(index, 0, moved)

      // reassign order numbers per group
      Object.keys(groups).forEach(col => {
        groups[col].forEach((t, i) => {
          if (!copy[t.id]) copy[t.id] = {}
          copy[t.id] = { ...copy[t.id], order: i, column: col }
        })
      })

      return copy
    })
  }

  return (
    <div id="app-root">
      <header className="app-header">
        <h1>اپ ساده مدیریت تسک (نمونه کار)</h1>
        <p className="subtitle">سه ستون _ کشیدن و رها کردن _ ذخیره در Local Storage</p>
      </header>

      <main className="board">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            columnId={col.id}
            title={col.title}
            tasks={Object.values(tasks).filter(t => t.column === col.id)}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            moveTask={moveTask}
          />
        ))}
      </main>

      <footer className="app-footer">ساخته شده با React Hooks _ داده‌ها در Local Storage ذخیره می‌شوند</footer>
    </div>
  )
}

export default App;
