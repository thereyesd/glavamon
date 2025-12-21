import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import BottomNav from './components/common/BottomNav'
import ProtectedRoute, { PublicOnlyRoute } from './components/common/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Client Pages
import ServiceSelection from './pages/client/ServiceSelection'
import BookingDetails from './pages/client/BookingDetails'
import Confirmation from './pages/client/Confirmation'
import UploadPayment from './pages/client/UploadPayment'
import BookingSuccess from './pages/client/BookingSuccess'
import MyBookings from './pages/client/MyBookings'
import Profile from './pages/client/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminBookingsList from './pages/admin/BookingsList'
import ServicesManager from './pages/admin/ServicesManager'
import StylistsManager from './pages/admin/StylistsManager'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-background-dark">
      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Client Routes - Some require auth */}
        <Route path="/" element={<ServiceSelection />} />
        <Route path="/booking" element={<BookingDetails />} />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-payment"
          element={
            <ProtectedRoute>
              <UploadPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-success"
          element={
            <ProtectedRoute>
              <BookingSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Require admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminBookingsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute requireAdmin>
              <ServicesManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stylists"
          element={
            <ProtectedRoute requireAdmin>
              <StylistsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom Navigation - only show when logged in and not on auth pages */}
      {currentUser && <BottomNav />}
    </div>
  )
}
