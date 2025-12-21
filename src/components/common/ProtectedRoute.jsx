import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FullPageLoader } from './LoadingSpinner'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, userProfile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullPageLoader />
  }

  if (!currentUser) {
    // Redirect to login, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && userProfile?.role !== 'admin') {
    // Not an admin, redirect to home
    return <Navigate to="/" replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullPageLoader />
  }

  if (currentUser) {
    // User is logged in, redirect to where they came from or home
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  return children
}
