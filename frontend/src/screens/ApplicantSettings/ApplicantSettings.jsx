import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiEdit, FiLock, FiLogOut, FiTrash2, FiUser, FiBriefcase, FiStar, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi'
import { getProfile, setProfile, clearProfile } from '../../utils/signupFlow'
import LocationPicker from '../../components/LocationPicker'
import './ApplicantSettings.css'

const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
]

const settingsOptions = [
  {
    key: 'edit-profile',
    title: 'Edit profile',
    description: 'Update bio, experience, skills, and name from one place.',
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

function ApplicantSettings() {
  const { signOut, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const profileData = getProfile() || {}

  const [activeKey, setActiveKey] = useState('edit-profile')
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    bio: profileData.bio || '',
    experience: profileData.experience || '',
    location: profileData.location || '',
    skills: Array.isArray(profileData.skills) ? profileData.skills : [],
  })
  const [newSkill, setNewSkill] = useState('')

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

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && !profileForm.skills.includes(skill)) {
      setProfileForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }))
      setNewSkill('')
    }
  }

  const removeSkill = (s) => {
    setProfileForm((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }))
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
        const res = await fetch('http://localhost:5000/api/onboarding/applicant', {
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
          <div className="settings-field">
            <span className="field-label"><FiMapPin /> Location</span>
            <LocationPicker
              value={profileForm.location}
              onChange={(val) => setProfileForm((prev) => ({ ...prev, location: val }))}
            />
          </div>
          <label className="settings-field">
            <span className="field-label"><FiUser /> Bio</span>
            <textarea name="bio" rows={3} value={profileForm.bio} onChange={handleProfileChange} className="settings-textarea" placeholder="Write a short professional bio…" />
          </label>
          <div className="settings-field">
            <span className="field-label"><FiBriefcase /> Experience</span>
            <div className="exp-pill-grid">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`exp-pill${profileForm.experience === opt ? ' active' : ''}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, experience: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-field">
            <span className="field-label"><FiStar /> Skills</span>
            <div className="skills-container">
              {profileForm.skills.map((skill) => (
                <button key={skill} type="button" className="skill-tag" onClick={() => removeSkill(skill)}>
                  {skill} <span className="skill-remove">×</span>
                </button>
              ))}
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                className="skill-input"
                placeholder="Type skill & press Enter…"
              />
            </div>
          </div>
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

export default ApplicantSettings
