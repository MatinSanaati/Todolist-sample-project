import React, { useEffect, useState, useRef } from 'react'
import './Alert.css'

export default function Alert({ message, onClose, type = 'error', backdrop = true }) {
    const [exiting, setExiting] = useState(false)
    const timerRef = useRef(null)

    useEffect(() => {
        if (!message) return
        timerRef.current = setTimeout(() => {
            setExiting(true)
            setTimeout(() => onClose && onClose(), 420)
        }, 2600)
        return () => clearTimeout(timerRef.current)
    }, [message, onClose])

    if (!message) return null

    return (
        <div className={`notify-root ${backdrop ? 'with-backdrop' : ''} ${exiting ? 'exiting' : ''}`}>
            <div className={`alert alert-${type} ${exiting ? 'exiting' : ''}`} role="alert">
                <span className="alert-message">{message}</span>
            </div>
        </div>
    )
}
