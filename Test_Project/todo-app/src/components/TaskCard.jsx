import React, { useState } from 'react'
import './taskcard.css'

export default function TaskCard({ task, updateTask, deleteTask }) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [desc, setDesc] = useState(task.description || '')

    const onDragStart = e => {
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const save = () => {
        if (!title.trim()) return
        updateTask(task.id, { title: title.trim(), description: desc })
        setEditing(false)
    }

    return (
        <article className="task-card" draggable onDragStart={onDragStart}>
            <div className="task-top">
                {editing ? (
                    <input value={title} onChange={e => setTitle(e.target.value)} onBlur={save} />
                ) : (
                    <h3>{task.title}</h3>
                )}
                <div className="task-actions">
                    <button onClick={() => deleteTask(task.id)}>حذف</button>
                    <button onClick={() => { if (editing) save(); else setEditing(true) }}>{editing ? 'ذخیره' : 'ویرایش'}</button>
                </div>
            </div>
            <div className="task-body">
                {editing ? (
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} onBlur={save} />
                ) : (
                    <p className="desc">{task.description}</p>
                )}
                <time className="created">{new Date(task.createdAt).toLocaleString()}</time>
            </div>
        </article>
    )
}
