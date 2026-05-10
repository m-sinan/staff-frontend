import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Staffs from './pages/Staffs'
import Attendance from './pages/Attendance'
import AttendanceSubmit from './pages/AttendanceSubmit'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Login />} />
          <Route path='/submit' element={<AttendanceSubmit />} />

          {/* Protected routes - owner only */}
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/staffs' element={
            <ProtectedRoute>
              <Staffs />
            </ProtectedRoute>
          } />
          <Route path='/attendance' element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App