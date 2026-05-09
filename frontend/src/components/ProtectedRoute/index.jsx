import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ role, children }) {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/signin" replace />
  }

  if (role && currentUser.role !== role) {
    const fallbackRoute =
      currentUser.role === 'recruiter' ? '/recruiter/dashboard' : '/applicant/jobs'
    return <Navigate to={fallbackRoute} replace />
  }

  return children
}

export default ProtectedRoute
