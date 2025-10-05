import React, { useEffect, useState } from 'react'
import './task-card.css'
import confirm from '../../utils/confirm'
import successNotify from '../../utils/successNotify'
import editTask from '../../utils/edit'

export default function TaskCard({ task, updateTask, deleteTask }) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [desc, setDesc] = useState(task.description || '')

    useEffect(() => {
        if (task.isNew) {
            const timer = setTimeout(() => {
                updateTask(task.id, { isNew: false })
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [task.isNew, task.id, updateTask])

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
        <article
            className={`task-card ${task.isNew ? 'task-card--flash' : ''}`}
            draggable
            onDragStart={onDragStart}
        >
            <div className="task-top">
                {editing ? (
                    <input value={title} onChange={e => setTitle(e.target.value)} onBlur={save} />
                ) : (
                    <h3>{task.title}</h3>
                )}
                <div className="task-actions">
                    <button onClick={async () => {
                        const ok = await confirm({ title: 'حذف تسک', message: `آیا از حذف «${task.title}» مطمئن هستید؟`, confirmText: 'حذف', cancelText: 'انصراف' })
                        if (ok) {
                            deleteTask(task.id)
                            try { successNotify('تسک با موفقیت حذف شد') } catch (e) { }
                        }
                    }}>حذف</button>
                    <button onClick={async () => {
                        const data = await editTask({ title: task.title, description: task.description })
                        if (data && data.title && data.title.trim()) {
                            updateTask(task.id, { title: data.title.trim(), description: data.description })
                            try { successNotify('تسک ویرایش شد') } catch (e) { }
                        }
                    }}>{editing ? 'ذخیره' : 'ویرایش'}</button>
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
