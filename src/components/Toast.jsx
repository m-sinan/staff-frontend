import { useEffect } from 'react'
import '../styles/Toast.css'

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`toast toast-${type}`}>
            <span className='toast-icon'>
                {type === 'success' ? '✅' : '❌'}
            </span>
            <span className='toast-message'>{message}</span>
            <button className='toast-close' onClick={onClose}>✕</button>
        </div>
    )
}

export default Toast