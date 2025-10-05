import React, { useState, useRef } from 'react'
import TaskCard from './TaskCard'
import './column.css'
import notify from '../utils/notify'

export default function Column({ columnId, title, tasks = [], addTask, updateTask, deleteTask, moveTask }) {
    const [newTitle, setNewTitle] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [titleDir, setTitleDir] = useState('rtl')
    const [descDir, setDescDir] = useState('rtl')
    const [dragOver, setDragOver] = useState(false)
    const [shakeForm, setShakeForm] = useState(false)
    const listRef = useRef(null)

    // detect if input contains persian/arabic characters -> use RTL, otherwise LTR
    const containsPersian = str => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str)

    const onTitleChange = e => {
        const v = e.target.value
        setNewTitle(v)
        setTitleDir(containsPersian(v) ? 'rtl' : 'ltr')
    }
    const onDescChange = e => {
        const v = e.target.value
        setNewDesc(v)
        setDescDir(containsPersian(v) ? 'rtl' : 'ltr')
    }

    const onAdd = e => {
        e.preventDefault()
        // Require both fields filled (user requested validation)
        if (!newTitle.trim() || !newDesc.trim()) {
            setShakeForm(true)
            // visual shake on the whole app-root for device-like effect
            const root = document.getElementById('app-root')
            if (root) {
                root.classList.add('device-shake')
                setTimeout(() => root.classList.remove('device-shake'), 600)
            }
            // remove shake after animation
            setTimeout(() => setShakeForm(false), 600)
            notify('لطفاً همهٔ فیلدها را پر کنید', 'error')
            return
        }

        addTask(newTitle.trim(), newDesc.trim())
        setNewTitle('')
        setNewDesc('')
        setErrorMsg('')
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
                <form className={`add-form ${shakeForm ? 'shake' : ''}`} onSubmit={onAdd} noValidate>
                    <input
                        aria-label="عنوان جدید"
                        placeholder="عنوان تسک"
                        value={newTitle}
                        onChange={onTitleChange}
                        className={titleDir === 'rtl' ? 'rtl' : 'ltr'}
                    />
                    <input
                        aria-label="توضیحات جدید"
                        placeholder="توضیحات (اختیاری)"
                        value={newDesc}
                        onChange={onDescChange}
                        className={descDir === 'rtl' ? 'rtl' : 'ltr'}
                    />
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
