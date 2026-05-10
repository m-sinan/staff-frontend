import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from '../utils/axios'
import Toast from '../components/Toast'
import '../styles/Attendance.css'

function Attendance() {
    const [attendance, setAttendance] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [staffIdSearch, setStaffIdSearch] = useState('')
    const [locationSearch, setLocationSearch] = useState('')
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchAttendance()
    }, [])

    useEffect(() => {
        handleFilter()
    }, [staffIdSearch, locationSearch, attendance])

    const getConfig = () => {
        const token = localStorage.getItem('token')
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    const showToast = (message, type) => {
        setToast({ message, type })
    }

    const fetchAttendance = async () => {
        try {
            const res = await axios.get('/attendance', getConfig())
            setAttendance(res.data)
            setFiltered(res.data)
        } catch (error) {
            showToast('Failed to load attendance', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleFilter = () => {
        let result = attendance

        if (staffIdSearch.trim() !== '') {
            result = result.filter((a) =>
                a.staff_Id.toString().includes(staffIdSearch.trim())
            )
        }

        if (locationSearch.trim() !== '') {
            result = result.filter((a) =>
                a.location.toLowerCase().includes(locationSearch.trim().toLowerCase())
            )
        }

        setFiltered(result)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const clearFilters = () => {
        setStaffIdSearch('')
        setLocationSearch('')
    }

    return (
        <div>
            <Navbar />
            <div className='attendance-container'>

                <div className='attendance-header'>
                    <div>
                        <h1 className='attendance-title'>Attendance</h1>
                        <p className='attendance-subtitle'>
                            View and filter attendance records
                        </p>
                    </div>
                    <div className='attendance-count'>
                        Total Records:
                        <span>{filtered.length}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className='filter-card'>
                    <div className='filter-group'>
                        <label>Search by Staff ID</label>
                        <input
                            type='text'
                            placeholder='Enter staff ID...'
                            value={staffIdSearch}
                            onChange={(e) => setStaffIdSearch(e.target.value)}
                        />
                    </div>

                    <div className='filter-group'>
                        <label>Search by Location</label>
                        <input
                            type='text'
                            placeholder='Enter location...'
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                        />
                    </div>

                    <button className='clear-btn' onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className='loading'>
                        <div className='spinner'></div>
                        <p>Loading attendance...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className='no-data'>
                        <p>😔 No attendance records found</p>
                    </div>
                ) : (
                    <div className='table-wrapper'>
                        <table className='attendance-table'>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Staff ID</th>
                                    <th>Location</th>
                                    <th>Master</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((a) => (
                                    <tr key={a._id}>
                                        <td>{a.staff_name}</td>
                                        <td>
                                            <span className='id-badge'>
                                                {a.staff_Id}
                                            </span>
                                        </td>
                                        <td>📍 {a.location}</td>
                                        <td>{a.master}</td>
                                        <td>{formatDate(a.date)}</td>
                                        <td>
                                            <span className={`status-badge ${a.status === 'Present' ? 'present' : 'absent'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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

export default Attendance