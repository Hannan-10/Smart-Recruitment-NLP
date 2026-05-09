import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../Navbar'
import { needsOnboarding } from '../../utils/signupFlow'

function RecruiterShell() {
  const { currentUser } = useAuth()
  
  if (!currentUser || currentUser.role !== 'recruiter') {
    return <Navigate to="/signin" replace />
  }

  if (needsOnboarding()) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="page-shell dashboard-layout">
      <Navbar />
      <Outlet />
    </div>
  )
}

export default RecruiterShell
