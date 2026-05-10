import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

function Navbar() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleNav = (path) => {
        navigate(path)
        setMenuOpen(false) // close menu on navigation
    }

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/staffs', label: 'Staffs' },
        { path: '/attendance', label: 'Attendance' },
    ]

    return (
        <nav className='navbar'>
            <div className='navbar-brand'>MEZAevents</div>

            {/* Hamburger — only visible on mobile */}
            <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => handleNav(item.path)}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <button
                className={`logout-button ${menuOpen ? 'open' : ''}`}
                onClick={handleLogout}
            >
                Logout
            </button>
        </nav>
    )
}

export default Navbar