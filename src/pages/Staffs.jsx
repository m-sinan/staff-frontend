import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import axios from '../utils/axios'
import '../styles/Staffs.css'
import Toast from '../components/Toast'

function Staffs() {
    const [staffs, setStaffs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editStaff, setEditStaff] = useState(null)
    const [toast, setToast] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        staff_Id: '',
        location: '',
        phone_Number: ''
    })
    const [photo, setPhoto] = useState(null)
    const [error, setError] = useState('')
    const lastCardRef = useRef(null)

    useEffect(() => {
        fetchStaffs()
    }, [])

    const showToast = (message, type) => {
        setToast({ message, type })
    }

    const getConfig = () => {
        const token = localStorage.getItem('token')
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    const fetchStaffs = async () => {
        try {
            const res = await axios.get('/staffs', getConfig())
            setStaffs(res.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0])
    }

    const openAddModal = () => {
        setEditStaff(null)
        setFormData({ name: '', staff_Id: '', location: '', phone_Number: '' })
        setPhoto(null)
        setError('')
        setShowModal(true)
    }

    const openEditModal = (staff) => {
        setEditStaff(staff)
        setFormData({
            name: staff.name,
            staff_Id: staff.staff_Id,
            location: staff.location,
            phone_Number: staff.phone_Number
        })
        setPhoto(null)
        setError('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditStaff(null)
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('staff_Id', formData.staff_Id)
            data.append('location', formData.location)
            data.append('phone_Number', formData.phone_Number)
            if (photo) data.append('photo', photo)

            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            }

            if (editStaff) {
                await axios.put(`/staffs/${editStaff.staff_Id}`, data, config)
                showToast('Staff updated successfully!', 'success')
            } else {
                await axios.post('/staffs', data, config)
                showToast('Staff added successfully!', 'success')
            }

            fetchStaffs()
            closeModal()

        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
            showToast('Action failed. Please try again.', 'error')
        }
    }

    const handleDelete = async (staffId) => {
        if (!window.confirm('Are you sure you want to delete this staff?')) return
        try {
            await axios.delete(`/staffs/${staffId}`, getConfig())
            showToast('Staff deleted successfully!', 'success')
            fetchStaffs()
        } catch (error) {
            showToast('Failed to delete staff.', 'error')
            console.log(error)
        }
    }

    const getPhotoUrl = (staff) => {
        try {
            if (
                staff.profileImage &&
                staff.profileImage.data &&
                staff.profileImage.data.data
            ) {
                const bytes = new Uint8Array(staff.profileImage.data.data)
                let binary = ''
                for (let i = 0; i < bytes.length; i++) {
                    binary += String.fromCharCode(bytes[i])
                }
                const base64 = btoa(binary)
                return `data:${staff.profileImage.contentType};base64,${base64}`
            }
            return null
        } catch (error) {
            return null
        }
    }

    const scrollToLast = () => {
        lastCardRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleWhatsAppShare = (staff) => {
        const message =
            `👤 *Staff Details*\n` +
            `📛 Name: ${staff.name}\n` +
            `🪪 Staff ID: ${staff.staff_Id}\n` +
            `📍 Location: ${staff.location}\n` +
            `📞 Phone: ${staff.phone_Number}`

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <div>
            <Navbar />
            <div className='staffs-container'>

                <div className='staffs-header'>
                    <div>
                        <h1 className='staffs-title'>Staffs</h1>
                        <p className='staffs-subtitle'>Manage your staff members</p>
                    </div>
                    <div className='header-buttons'>
                        <button className='scroll-button' onClick={scrollToLast}>
                            ⬇ Last Staff
                        </button>
                        <button className='add-button' onClick={openAddModal}>
                            + Add Staff
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className='loading'>
                        <div className='spinner'></div>
                        <p>Loading staffs...</p>
                    </div>
                ) : (
                    <div className='staffs-grid'>
                        {staffs.map((staff, index) => (
                            <div
                                className='staff-card'
                                key={staff._id}
                                ref={index === staffs.length - 1 ? lastCardRef : null}
                            >
                                <div className='staff-photo-wrapper'>
                                    {getPhotoUrl(staff) ? (
                                        <img
                                            src={getPhotoUrl(staff)}
                                            alt={staff.name}
                                            className='staff-photo'
                                            loading='lazy'
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    ) : (
                                        <div className='staff-photo-default'>
                                            {staff.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className='staff-info'>
                                    <h3>{staff.name}</h3>
                                    <p>🪪 ID: {staff.staff_Id}</p>
                                    <p>📍 {staff.location}</p>
                                    <p>📞 {staff.phone_Number}</p>
                                </div>

                                <div className='staff-actions'>
                                    <button
                                        className='edit-btn'
                                        onClick={() => openEditModal(staff)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className='delete-btn'
                                        onClick={() => handleDelete(staff.staff_Id)}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <button
                                    className='share-btn'
                                    onClick={() => handleWhatsAppShare(staff)}
                                >
                                    📤 Share on WhatsApp
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className='modal-overlay' onClick={closeModal}>
                    <div className='modal' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h2>{editStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
                            <button className='modal-close' onClick={closeModal}>✕</button>
                        </div>

                        {error && <div className='modal-error'>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className='form-group'>
                                <label>Full Name</label>
                                <input
                                    type='text'
                                    name='name'
                                    placeholder='Enter full name'
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className='form-group'>
                                <label>Staff ID</label>
                                <input
                                    type='number'
                                    name='staff_Id'
                                    placeholder='Enter staff ID'
                                    value={formData.staff_Id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!editStaff}
                                />
                            </div>

                            <div className='form-group'>
                                <label>Location</label>
                                <input
                                    type='text'
                                    name='location'
                                    placeholder='Enter location'
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className='form-group'>
                                <label>Phone Number</label>
                                <input
                                    type='number'
                                    name='phone_Number'
                                    placeholder='Enter phone number'
                                    value={formData.phone_Number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className='form-group'>
                                <label>Profile Photo (optional)</label>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handlePhotoChange}
                                />
                            </div>

                            <div className='modal-buttons'>
                                <button
                                    type='button'
                                    className='cancel-btn'
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button type='submit' className='save-btn'>
                                    {editStaff ? 'Update Staff' : 'Add Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
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

export default Staffs