import { createContext, useState, useContext } from 'react'

// 1. Create the context
const AuthContext = createContext()

// 2. Create the provider
export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem('token') || null
    )

    // Login function
    const login = (newToken) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
    }

    // Logout function
    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// 3. Custom hook to use auth anywhere
export function useAuth() {
    return useContext(AuthContext)
}