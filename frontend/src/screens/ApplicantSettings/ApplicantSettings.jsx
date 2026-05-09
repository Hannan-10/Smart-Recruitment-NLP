import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiEdit, FiLock, FiLogOut, FiTrash2, FiUser, FiBriefcase, FiStar } from 'react-icons/fi'
import { getProfile, setProfile } from '../../utils/signupFlow'
import './ApplicantSettings.css'

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
    description: 'Permanently remove your local demo data.',
    actionLabel: 'Delete account',
    icon: FiTrash2,
    warning: 'This action cannot be undone.',
  },
]

const getSkillList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  }
  return []
}

function ApplicantSettings() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const profileData = getProfile() || {}
  const [activeKey, setActiveKey] = useState('edit-profile')
  const [statusMessage, setStatusMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [profileForm, setProfileForm] = useState({
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    experience: profileData.experience || '',
    skills: getSkillList(profileData.skills),
  })
  const [newSkill, setNewSkill] = useState('')

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && !profileForm.skills.includes(skill)) {
      setProfileForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setProfileForm((prev) => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }))
  }

  const handleSkillKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSkill()
    }
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const activeOption = settingsOptions.find((option) => option.key === activeKey)

  const handlePrimaryAction = () => {
    if (!activeOption) return

    if (activeOption.key === 'edit-profile') {
      setProfile({
        ...profileData,
        ...profileForm,
      })
      setStatusMessage('Profile updated successfully.')
      return
    }

    if (activeOption.key === 'reset-password') {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setStatusMessage('Please fill in all password fields.')
        return
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setStatusMessage('New password and confirmation must match.')
        return
      }
      setStatusMessage('Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      return
    }

    if (activeOption.key === 'logout') {
      signOut()
      navigate('/signin')
      return
    }

    if (activeOption.key === 'delete-account') {
      if (deleteConfirm.trim().toLowerCase() !== 'delete') {
        setStatusMessage('Type DELETE into the confirmation field to unlock this action.')
        return
      }
      localStorage.clear()
      signOut()
      navigate('/signin')
    }
  }

  const renderActiveContent = () => {
    if (activeKey === 'edit-profile') {
      return (
        <div className="settings-form">
          <div className="settings-field-row">
            <label>
              <span className="field-label"><FiUser /> First name</span>
              <input
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="settings-input"
                placeholder="First name"
              />
            </label>
            <label>
              <span className="field-label"><FiUser /> Last name</span>
              <input
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                className="settings-input"
                placeholder="Last name"
              />
            </label>
          </div>
          <label className="settings-field">
            <span className="field-label"><FiBriefcase /> Experience</span>
            <textarea
              name="experience"
              rows={3}
              value={profileForm.experience}
              onChange={handleProfileChange}
              className="settings-textarea"
              placeholder="Describe your experience"
            />
          </label>
          <label className="settings-field">
            <span className="field-label"><FiStar /> Skills</span>
            <div className="skills-container">
              {profileForm.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="skill-tag"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} <span className="skill-remove">×</span>
                </button>
              ))}
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                className="skill-input"
                placeholder="Add a skill..."
              />
            </div>
          </label>
        </div>
      )
    }

    if (activeKey === 'reset-password') {
      return (
        <div className="settings-form">
          <div className="settings-field">
            <label>Current password</label>
            <div className="settings-field-input-wrapper">
              <FiLock />
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="settings-input"
                placeholder="Enter current password"
              />
            </div>
          </div>
          <div className="settings-field">
            <label>New password</label>
            <div className="settings-field-input-wrapper">
              <FiLock />
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="settings-input"
                placeholder="Enter new password"
              />
            </div>
          </div>
          <div className="settings-field">
            <label>Confirm new password</label>
            <div className="settings-field-input-wrapper">
              <FiLock />
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="settings-input"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>
      )
    }

    if (activeKey === 'logout') {
      return (
        <div className="settings-form">
          <p className="panel-copy">
            Logging out will end your current session and return you to the sign-in screen. Your data remains stored locally.
          </p>
        </div>
      )
    }

    if (activeKey === 'delete-account') {
      return (
        <div className="settings-form">
          <p className="panel-copy">
            This will permanently erase your local profile data and sign you out. Please type <strong>DELETE</strong> to confirm.
          </p>
          <label className="settings-field">
            Confirm delete
            <input
              name="deleteConfirm"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              className="settings-input"
              placeholder="Type DELETE to confirm"
            />
          </label>
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
                    onClick={() => {
                      setActiveKey(option.key)
                      setStatusMessage('')
                    }}
                  >
                    <span className="settings-option-icon">
                      <Icon />
                    </span>
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
            {renderActiveContent()}
            <button type="button" className="panel-action-btn" onClick={handlePrimaryAction}>
              {activeOption?.actionLabel}
            </button>
            {statusMessage && <p className="settings-status">{statusMessage}</p>}
          </div>
        </section>
      </div>
    </main>
  )
}

export default ApplicantSettings
