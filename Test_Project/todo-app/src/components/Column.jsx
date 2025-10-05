import React, { useState, useRef } from 'react'
import TaskCard from './TaskCard'
import './column.css'

export default function Column({ columnId, title, tasks = [], addTask, updateTask, deleteTask, moveTask }) {
    const [newTitle, setNewTitle] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const listRef = useRef(null)

    const onAdd = e => {
        e.preventDefault()
        if (!newTitle.trim()) return
        addTask(newTitle.trim(), newDesc.trim())
        setNewTitle('')
        setNewDesc('')
    }

    const handleDragOver = e => {
        e.preventDefault()
        setDragOver(true)
    }
    const handleDragLeave = () => setDragOver(false)
    const handleDrop = e => {
        e.preventDefault()
        setDragOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (!id) return
        moveTask(id, columnId)
    }

    return (
        <section className={`column ${dragOver ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} ref={listRef}>
            <header className="column-header">
                <h2>{title} <span className="count">({tasks.length})</span></h2>
            </header>

            {columnId === 'todo' && (
                <form className="add-form" onSubmit={onAdd}>
                    <input aria-label="عنوان جدید" placeholder="عنوان تسک" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                    <input aria-label="توضیحات جدید" placeholder="توضیحات (اختیاری)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                    <button type="submit">افزودن</button>
                </form>
            )}

            <div className="task-list">
                {tasks.sort((a, b) => 0).map(task => (
                    <TaskCard key={task.id} task={task} updateTask={updateTask} deleteTask={deleteTask} />
                ))}
            </div>
        </section>
    )
}
