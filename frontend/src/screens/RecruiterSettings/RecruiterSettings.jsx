import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiEdit, FiLock, FiLogOut, FiTrash2, FiUser, FiBriefcase, FiUsers, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi'
import { getProfile, setProfile, clearProfile } from '../../utils/signupFlow'
import '../ApplicantSettings/ApplicantSettings.css'

const settingsOptions = [
  {
    key: 'edit-profile',
    title: 'Edit profile',
    description: 'Update company details, industry, and name from one place.',
    actionLabel: 'Save profile',
    icon: FiEdit,
  },
  {
    key: 'reset-password',
    title: 'Reset password',
    description: 'Secure your account by updating your password.',
    actionLabel: 'Update password',
    icon: FiLock,
  },
  {
    key: 'logout',
    title: 'Log out',
    description: 'Sign out of the application on this device.',
    actionLabel: 'Log out now',
    icon: FiLogOut,
  },
  {
    key: 'delete-account',
    title: 'Delete account',
    description: 'Permanently remove your account and all associated data.',
    actionLabel: 'Delete account',
    icon: FiTrash2,
    warning: 'This action cannot be undone.',
  },
]

function RecruiterSettings() {
  const { signOut, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const profileData = getProfile() || {}

  const [activeKey, setActiveKey] = useState('edit-profile')
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    companyName: profileData.companyName || '',
    companySize: profileData.companySize || '',
    industry: profileData.industry || '',
    location: profileData.location || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false })

  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePwd, setShowDeletePwd] = useState(false)

  const setStatus = (text, type = 'success') => setStatusMessage({ text, type })
  const clearStatus = () => setStatusMessage({ text: '', type: '' })

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const activeOption = settingsOptions.find((o) => o.key === activeKey)

  const handlePrimaryAction = async () => {
    if (!activeOption) return
    clearStatus()
    setLoading(true)

    try {
      if (activeKey === 'edit-profile') {
        const res = await fetch('http://localhost:5000/api/onboarding/recruiter', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify(profileForm),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Update failed')
        setProfile({ ...profileData, ...profileForm })
        setStatus('Profile updated successfully.')
        return
      }

      if (activeKey === 'reset-password') {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
          setStatus('Please fill in all password fields.', 'error')
          return
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setStatus('New password and confirmation must match.', 'error')
          return
        }
        const res = await fetch('http://localhost:5000/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify(passwordForm),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Password update failed')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setStatus('Password updated successfully.')
        return
      }

      if (activeKey === 'logout') {
        signOut()
        navigate('/signin')
        return
      }

      if (activeKey === 'delete-account') {
        if (!deletePassword) {
          setStatus('Enter your password to confirm deletion.', 'error')
          return
        }
        const res = await fetch('http://localhost:5000/api/auth/account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ password: deletePassword }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Deletion failed')
        clearProfile()
        signOut()
        navigate('/signin')
        return
      }
    } catch (err) {
      setStatus(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (activeKey === 'edit-profile') {
      return (
        <div className="settings-form">
          <div className="settings-field-row">
            <label className="settings-field">
              <span className="field-label"><FiUser /> First name</span>
              <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} className="settings-input" placeholder="First name" />
            </label>
            <label className="settings-field">
              <span className="field-label"><FiUser /> Last name</span>
              <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} className="settings-input" placeholder="Last name" />
            </label>
          </div>
          <label className="settings-field">
            <span className="field-label"><FiBriefcase /> Company name</span>
            <input name="companyName" value={profileForm.companyName} onChange={handleProfileChange} className="settings-input" placeholder="e.g. Tech Corp" />
          </label>
          <div className="settings-field-row">
            <label className="settings-field">
              <span className="field-label"><FiUsers /> Company size</span>
              <input name="companySize" value={profileForm.companySize} onChange={handleProfileChange} className="settings-input" placeholder="e.g. 11-50" />
            </label>
            <label className="settings-field">
              <span className="field-label"><FiBriefcase /> Industry</span>
              <input name="industry" value={profileForm.industry} onChange={handleProfileChange} className="settings-input" placeholder="e.g. IT & Software" />
            </label>
          </div>
          <label className="settings-field">
            <span className="field-label"><FiMapPin /> Location</span>
            <input name="location" value={profileForm.location} onChange={handleProfileChange} className="settings-input" placeholder="e.g. New York, USA" />
          </label>
        </div>
      )
    }

    if (activeKey === 'reset-password') {
      return (
        <div className="settings-form">
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => {
            const labels = { currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password' }
            const keys = { currentPassword: 'current', newPassword: 'new', confirmPassword: 'confirm' }
            const k = keys[field]
            return (
              <div key={field} className="settings-field">
                <span className="field-label"><FiLock /> {labels[field]}</span>
                <div className="pwd-input-wrap">
                  <input
                    type={showPwd[k] ? 'text' : 'password'}
                    name={field}
                    value={passwordForm[field]}
                    onChange={handlePasswordChange}
                    className="settings-input"
                    placeholder={labels[field]}
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => ({ ...p, [k]: !p[k] }))}>
                    {showPwd[k] ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (activeKey === 'logout') {
      return (
        <div className="settings-form">
          <p className="panel-copy">
            Logging out will end your current session and return you to the sign-in screen.
          </p>
        </div>
      )
    }

    if (activeKey === 'delete-account') {
      return (
        <div className="settings-form">
          <p className="panel-copy">
            This will permanently delete your account and all associated data. Enter your password to confirm.
          </p>
          <div className="settings-field">
            <span className="field-label"><FiLock /> Confirm with password</span>
            <div className="pwd-input-wrap">
              <input
                type={showDeletePwd ? 'text' : 'password'}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="settings-input"
                placeholder="Enter your password"
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowDeletePwd((p) => !p)}>
                {showDeletePwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <main className="dashboard-content settings-page">
      <div className="settings-container">
        <aside className="settings-sidebar">
          <div className="settings-sidebar-card">
            <p className="sidebar-title">Settings</p>
            <div className="settings-nav">
              {settingsOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    type="button"
                    key={option.key}
                    className={`settings-option ${activeKey === option.key ? 'active' : ''}`}
                    onClick={() => { setActiveKey(option.key); clearStatus() }}
                  >
                    <span className="settings-option-icon"><Icon /></span>
                    <span className="settings-option-copy">
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="settings-main">
          <div className="settings-header">
            <h1 className="dash-serif">{activeOption?.title}</h1>
            <p className="settings-description">{activeOption?.description}</p>
          </div>

          <div className="settings-panel">
            {activeOption?.warning && (
              <div className="panel-warning">
                <strong>Warning</strong>
                <p>{activeOption.warning}</p>
              </div>
            )}
            {renderContent()}
            <div className="panel-footer">
              <button
                type="button"
                className={`panel-action-btn${activeKey === 'delete-account' ? ' danger' : ''}`}
                onClick={handlePrimaryAction}
                disabled={loading}
              >
                {loading ? 'Please wait…' : activeOption?.actionLabel}
              </button>
              {statusMessage.text && (
                <p className={`settings-status ${statusMessage.type}`}>{statusMessage.text}</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default RecruiterSettings
