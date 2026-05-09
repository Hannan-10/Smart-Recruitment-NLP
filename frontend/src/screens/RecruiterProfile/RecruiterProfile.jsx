import { useState } from 'react'
import { FiUser, FiBriefcase, FiStar, FiEdit, FiSave, FiCamera } from 'react-icons/fi'
import { images } from '../../assets'
import { getProfile, setProfile } from '../../utils/signupFlow'
import './ApplicantProfile.css'

function RecruiterProfile() {
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

  const [form, setForm] = useState({
    firstName: savedProfile.firstName || '',
    lastName: savedProfile.lastName || '',
    company: savedProfile.company || '',
    experience: savedProfile.experience || '',
    skills: getSkillList(savedProfile.skills),
  })

  const [newSkill, setNewSkill] = useState('')

  const displayName = (form.firstName || form.lastName)
    ? `${form.firstName || ''} ${form.lastName || ''}`.trim()
    : 'Your name'

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

          {editMode && (
            <label className="photo-upload-btn">
              <FiCamera />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
          )}
        </div>

        <div className="profile-hero-info">
          {editMode ? (
            <div className="profile-name-edit">
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
              />
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
          ) : (
            <h1>{displayName}</h1>
          )}
          <p className="profile-role">
            <FiBriefcase /> {form.company || 'Recruiter'}
          </p>
        </div>

        <button className={`btn-profile-edit ${editMode ? 'saving' : ''}`} onClick={toggleEdit}>
          {editMode ? (
            <>
              <FiSave /> Save Profile
            </>
          ) : (
            <>
              <FiEdit /> Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-section">
          <div className="section-title">
            <FiUser className="section-icon" />
            <h3>About & Company</h3>
          </div>
          <div className="section-content">
            {editMode ? (
              <>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g., Tech Corp"
                  />
                </div>
                <div className="form-group">
                  <label>Experience & Background</label>
                  <textarea
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your recruiting background..."
                  />
                </div>
              </>
            ) : (
              <p className="profile-bio-text">
                {form.experience || 'No experience details added yet.'}
              </p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="section-title">
            <FiStar className="section-icon" />
            <h3>Hiring Expertise</h3>
          </div>
          <div className="section-content">
            <div className="skills-grid">
              {form.skills.map((skill) => (
                <div key={skill} className="skill-item">
                  {skill}
                  {editMode && (
                    <button onClick={() => removeSkill(skill)} className="skill-remove-btn">
                      ×
                    </button>
                  )}
                </div>
              ))}
              {editMode && (
                <div className="skill-add-wrap">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add expertise..."
                  />
                  <button onClick={addSkill} className="btn-skill-add">
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RecruiterProfile
