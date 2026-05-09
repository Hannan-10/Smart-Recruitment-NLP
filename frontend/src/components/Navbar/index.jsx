import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logos } from '../../assets'
import { getProfile } from '../../utils/signupFlow'
import './Navbar.css'

function Navbar() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const profile = getProfile()
  const displayName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      : currentUser?.email?.split('@')[0] || 'User'

  const onLogout = () => {
    signOut()
    navigate('/signin')
  }

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard' },
    { to: '/recruiter/post-job', label: 'Post Job' },
    { to: '/recruiter/applicants', label: 'Applicants CVs' },
  ]

  const recruiterSettings = [
    { to: '/recruiter/profile', label: 'Profile' },
    { to: '/recruiter/settings', label: 'Settings' },
  ]

  const applicantDiscover = [
    { to: '/applicant/jobs', label: 'Jobs' },
    { to: '/applicant/profile', label: 'Your Profile' },
    { to: '/applicant/applied-jobs', label: 'Applications' },
    { to: '/applicant/saved-jobs', label: 'Saved Roles' },
  ]

  const applicantSettings = [{ to: '/applicant/settings', label: 'Settings' }]

  const isRecruiter = currentUser?.role === 'recruiter'

  return (
    <aside className="sidebar">
      <div className="brand">
        {logos.MainLogo ? <img src={logos.MainLogo} alt="" className="brand-logo" /> : null}
        <h2>Recruiter Guide</h2>
      </div>

      {!isRecruiter ? (
        <div className="user-chip">
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt="" />
          ) : (
            <div className="avatar-fallback">{displayName.charAt(0).toUpperCase()}</div>
          )}
          <div>
            <strong>{displayName}</strong>
            <span>{profile?.bio?.slice(0, 42) || 'Complete your profile'}</span>
          </div>
        </div>
      ) : null}

      <div className="nav-links">
        {isRecruiter ? (
          <>
            <div className="nav-section-label">Manage</div>
            {recruiterLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
            <div className="nav-section-label">Settings</div>
            {recruiterSettings.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
          </>
        ) : (
          <>
            <div className="nav-section-label">Discover</div>
            {applicantDiscover.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
            <div className="nav-section-label">Settings</div>
            {applicantSettings.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
          </>
        )}
      </div>

      <button type="button" onClick={onLogout} className="logout-btn">
        Logout
      </button>
    </aside>
  )
}

export default Navbar
