import React, { useEffect, useState } from 'react'
import './App.css'
import Column from './components/Column'

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
    const newTask = { id, title, description: description || '', createdAt: new Date().toISOString() }
    setTasks(prev => ({ ...prev, [id]: { ...newTask, column: 'todo' } }))
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
      copy[id] = { ...copy[id], column: toColumn }
      // store ordering by adding an index meta map in each column by insertion order
      // We'll rebuild ordering on the fly in Column component
      return copy
    })
  }

  return (
    <div id="app-root">
      <header className="app-header">
        <h1>اپ ساده مدیریت تسک (کانبان)</h1>
        <p className="subtitle">سه ستون • کشیدن و رها کردن • ذخیره در Local Storage</p>
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

      <footer className="app-footer">ساخته شده با React Hooks • داده‌ها در Local Storage ذخیره می‌شوند</footer>
    </div>
  )
}

export default App;
