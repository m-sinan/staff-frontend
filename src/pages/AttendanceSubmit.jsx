import { useState, useEffect } from 'react'
import axios from '../utils/axios'
import Toast from '../components/Toast'
import '../styles/AttendanceSubmit.css'

function AttendanceSubmit() {
    const [staffId, setStaffId] = useState('')
    const [master, setMaster] = useState('')
    const [location, setLocation] = useState('')
    const [locationStatus, setLocationStatus] = useState('fetching')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        getLocation()
    }, [])

    const showToast = (message, type) => {
        setToast({ message, type })
    }

    const getLocation = () => {
        setLocationStatus('fetching')

        if (!navigator.geolocation) {
            setLocation('Location not supported')
            setLocationStatus('failed')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    )
                    const data = await res.json()
                    const place =
                        data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        data.address.county ||
                        'Unknown Location'
                    setLocation(place)
                    setLocationStatus('success')
                } catch {
                    setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                    setLocationStatus('success')
                }
            },
            () => {
                setLocation('Permission denied')
                setLocationStatus('failed')
            }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (locationStatus === 'fetching') {
            showToast('Please wait, getting your location...', 'error')
            return
        }

        if (locationStatus === 'failed') {
            showToast('Location access is required to submit attendance', 'error')
            return
        }

        setLoading(true)
        try {
            await axios.post('/attendance', {
                staff_Id: staffId,
                master: master,
                location: location,
                staff_name: '',
                status: 'Present'
            })
            showToast('Attendance submitted successfully!', 'success')
            setStaffId('')
            setMaster('')
        } catch (err) {
            const msg = err.response?.data?.message || 'Submission failed'
            showToast(msg, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='submit-container'>
            <div className='submit-card'>

                <div className='submit-logo'>📋</div>
                <h1 className='submit-title'>Mark Attendance</h1>
                <p className='submit-subtitle'>MEZAevents Staff Portal</p>

                {/* Location Status */}
                <div className={`location-box ${locationStatus}`}>
                    {locationStatus === 'fetching' && (
                        <>
                            <span className='location-spinner'></span>
                            <span>Getting your location...</span>
                        </>
                    )}
                    {locationStatus === 'success' && (
                        <>
                            <span>📍</span>
                            <span>{location}</span>
                        </>
                    )}
                    {locationStatus === 'failed' && (
                        <>
                            <span>⚠️</span>
                            <span>{location}</span>
                            <button
                                className='retry-btn'
                                onClick={getLocation}
                            >
                                Retry
                            </button>
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Staff ID</label>
                        <input
                            type='number'
                            placeholder='Enter your staff ID'
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label>Master / Supervisor Name</label>
                        <input
                            type='text'
                            placeholder='Enter master name'
                            value={master}
                            onChange={(e) => setMaster(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='submit-button'
                        disabled={loading || locationStatus === 'fetching'}
                    >
                        {loading ? 'Submitting...' : 'Submit Attendance'}
                    </button>
                </form>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}

export default AttendanceSubmit