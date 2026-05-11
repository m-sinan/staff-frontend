import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from '../utils/axios'
import '../styles/Login.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await axios.post('/auth/login', {
                email,
                password
            })

            login(response.data.token)
            navigate('/dashboard')

        } catch (err) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='login-container'>
            <div className='login-card'>
                <h1 className='login-title'>Staff Management</h1>
                <Link to='/dashboard' className='login-subtitle'><p className='login-subtitle'>Owner Login</p></Link>
                

                {error && <div className='login-error'>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Email</label>
                        <input
                            type='email'
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label>Password</label>
                        <input
                            type='password'
                            placeholder='Enter your password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='login-button'
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login