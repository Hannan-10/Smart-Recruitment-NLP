import { useState } from 'react'
import { FiUser, FiFileText, FiBriefcase, FiStar, FiEdit, FiSave, FiCamera } from 'react-icons/fi'
import { images } from '../../assets'
import { getProfile, setProfile } from '../../utils/signupFlow'
import './ApplicantProfile.css'

function ApplicantProfile() {
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

  const savedProfile = getProfile() || {}
  const [profile, setProfileState] = useState(savedProfile)
  const [editMode, setEditMode] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(savedProfile.photoPreview || '')
  const initialSkills = Array.isArray(savedProfile.skills)
    ? savedProfile.skills.join(', ')
    : savedProfile.skills || ''

  const [form, setForm] = useState({
    firstName: savedProfile.firstName || '',
    lastName: savedProfile.lastName || '',
    experience: savedProfile.experience || '',
    skills: getSkillList(savedProfile.skills),
  })

  const [newSkill, setNewSkill] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && !form.skills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }))
  }

  const handleSkillKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSkill()
    }
  }

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      ...form,
      photoPreview,
    }
    setProfile(updatedProfile)
    setProfileState(updatedProfile)
    setEditMode(false)
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const toggleEdit = () => {
    if (editMode) {
      handleSave()
    } else {
      setEditMode(true)
    }
  }

  return (
    <main className="dashboard-content profile-page">
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          {photoPreview ? (
            <img src={photoPreview} alt="Profile avatar" className="profile-hero-img" />
          ) : profile?.photoPreview ? (
            <img src={profile.photoPreview} alt="Profile avatar" className="profile-hero-img" />
          ) : images.SignInImg ? (
            <img src={images.SignInImg} alt="Profile avatar" className="profile-hero-img" />
          ) : (
            <div className="profile-hero-placeholder">{displayName.charAt(0)}</div>
          )}
          <label className="avatar-upload-label">
            <FiCamera />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="photo-input" />
          </label>
        </div>

        <div className="profile-hero-text">
          {editMode ? (
            <div className="edit-name-row">
              <input
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                className="edit-input"
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                className="edit-input"
              />
            </div>
          ) : (
            <h1 className="dash-serif">{displayName}</h1>
          )}

          <div className="profile-meta-row">
            <div className="profile-chip">
              <FiUser />
              <span>{profile?.email || 'No email set'}</span>
            </div>
            <div className="profile-chip">
              <FiStar />
              <span>{getSkillList(profile?.skills || form.skills).length} skills</span>
            </div>
          </div>

          <button onClick={toggleEdit} className="btn-profile-edit">
            {editMode ? <FiSave /> : <FiEdit />}
            {editMode ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <section className="info-card">
          <h2><FiBriefcase /> Experience</h2>
          {editMode ? (
            <textarea
              name="experience"
              rows={4}
              placeholder="Describe your experience..."
              value={form.experience}
              onChange={handleChange}
              className="edit-textarea"
            />
          ) : (
            <p>{profile?.experience || 'No experience added.'}</p>
          )}
        </section>
        <section className="info-card info-card--wide">
          <h2><FiStar /> Skills</h2>
          {editMode ? (
            <div className="skills-container">
              {form.skills.map((skill) => (
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
          ) : (
            <div className="skill-chips">
              {getSkillList(profile?.skills).map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                </span>
              ))}
              {getSkillList(profile?.skills).length === 0 && (
                <span className="muted">No skills added yet.</span>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ApplicantProfile

