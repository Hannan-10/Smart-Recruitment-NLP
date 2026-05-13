import { NavLink, Link, useNavigate } from 'react-router-dom'
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

  const isRecruiter = currentUser?.role === 'recruiter'
  const profilePath = isRecruiter ? '/recruiter/profile' : '/applicant/profile'
  const locationText = profile?.location || 'Add your location'

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

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logos.MainLogo} alt="Recruiter Guide" className="brand-logo" />
        <h2>Recruiter Guide</h2>
      </div>

      {/* USER CHIP — clickable for both roles */}
      <Link to={profilePath} className="user-chip">
        {profile?.photoPreview ? (
          <img src={profile.photoPreview} alt="" />
        ) : (
          <div className="avatar-fallback">{displayName.charAt(0).toUpperCase()}</div>
        )}
        <div className="user-chip-info">
          <strong>{displayName}</strong>
          <span className="user-chip-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locationText}
          </span>
        </div>
      </Link>

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
