import { useState, useEffect, useCallback } from 'react'
import { FiUser, FiBriefcase, FiStar, FiEdit, FiSave, FiCamera, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { getProfile, setProfile } from '../../utils/signupFlow'
import LocationPicker from '../../components/LocationPicker'
import './ApplicantProfile.css'

const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
]

function ApplicantProfile() {
  const { getAccessToken } = useAuth()
  const savedProfile = getProfile() || {}

  const [profileData, setProfileData] = useState(savedProfile)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(savedProfile.photoPreview || '')

  const [form, setForm] = useState({
    firstName: savedProfile.firstName || '',
    lastName: savedProfile.lastName || '',
    bio: savedProfile.bio || '',
    experience: savedProfile.experience || '',
    location: savedProfile.location || '',
    skills: Array.isArray(savedProfile.skills) ? savedProfile.skills : [],
  })
  const [newSkill, setNewSkill] = useState('')

  const displayName = (form.firstName || form.lastName)
    ? `${form.firstName || ''} ${form.lastName || ''}`.trim()
    : savedProfile.email?.split('@')[0] || 'Your Profile'

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/onboarding/profile', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const merged = {
        ...savedProfile,
        firstName: data.firstName || savedProfile.firstName || '',
        lastName: data.lastName || savedProfile.lastName || '',
        email: data.email || savedProfile.email || '',
        bio: data.bio || savedProfile.bio || '',
        experience: data.experience || savedProfile.experience || '',
        location: data.location || savedProfile.location || '',
        skills: data.skills?.length ? data.skills : (savedProfile.skills || []),
        photoPreview: savedProfile.photoPreview || '',
      }
      setProfileData(merged)
      setForm({
        firstName: merged.firstName,
        lastName: merged.lastName,
        bio: merged.bio,
        experience: merged.experience,
        location: merged.location,
        skills: Array.isArray(merged.skills) ? merged.skills : [],
      })
      setProfile(merged)
    } catch {}
    finally { setLoading(false) }
  }, [getAccessToken])

  useEffect(() => { fetchProfile() }, [fetchProfile])

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

  const removeSkill = (s) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/onboarding/applicant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          bio: form.bio,
          experience: form.experience,
          location: form.location,
          skills: form.skills,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')
      const updated = { ...profileData, ...form, photoPreview }
      setProfile(updated)
      setProfileData(updated)
      setEditMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setForm({
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      bio: profileData.bio || '',
      experience: profileData.experience || '',
      location: profileData.location || '',
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
    })
    setError('')
    setEditMode(false)
  }

  if (loading) {
    return (
      <main className="dashboard-content profile-page">
        <p className="profile-loading">Loading profile…</p>
      </main>
    )
  }

  return (
    <main className="dashboard-content profile-page">

      {/* HERO */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          {photoPreview ? (
            <img src={photoPreview} alt="" className="profile-hero-img" />
          ) : (
            <div className="profile-hero-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <label className="avatar-upload-label">
            <FiCamera />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="photo-input" />
          </label>
        </div>

        <div className="profile-hero-text">
          {editMode ? (
            <div className="edit-name-row">
              <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} className="edit-input" />
              <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} className="edit-input" />
            </div>
          ) : (
            <h1 className="dash-serif">{displayName}</h1>
          )}

          <div className="profile-meta-row">
            <div className="profile-chip">
              <FiUser />
              <span>{profileData.email || 'No email'}</span>
            </div>
            {profileData.location && (
              <div className="profile-chip">
                <FiMapPin />
                <span>{profileData.location}</span>
              </div>
            )}
            <div className="profile-chip">
              <FiStar />
              <span>{form.skills.length} skill{form.skills.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="profile-action-row">
            <button onClick={editMode ? handleSave : () => setEditMode(true)} className="btn-profile-edit" disabled={saving}>
              {editMode ? <FiSave /> : <FiEdit />}
              {saving ? 'Saving…' : editMode ? 'Save Profile' : 'Edit Profile'}
            </button>
            {editMode && (
              <button type="button" className="btn-profile-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>

          {error && <p className="profile-error">{error}</p>}
        </div>
      </div>

      {/* CARDS */}
      <div className="profile-grid">

        <section className="info-card">
          <h2><FiUser /> Bio</h2>
          {editMode ? (
            <textarea name="bio" rows={4} placeholder="Write a short professional bio…" value={form.bio} onChange={handleChange} className="edit-textarea" />
          ) : (
            <p>{profileData.bio || 'No bio added yet.'}</p>
          )}
        </section>

        <section className="info-card">
          <h2><FiMapPin /> Location</h2>
          {editMode ? (
            <LocationPicker
              value={form.location}
              onChange={(val) => setForm((prev) => ({ ...prev, location: val }))}
            />
          ) : (
            <p>{profileData.location || 'No location added.'}</p>
          )}
        </section>

        <section className="info-card info-card--wide">
          <h2><FiBriefcase /> Experience</h2>
          {editMode ? (
            <div className="exp-pill-grid">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`exp-pill${form.experience === opt ? ' active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, experience: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <p>{profileData.experience || 'No experience added.'}</p>
          )}
        </section>

        <section className="info-card info-card--wide">
          <h2><FiStar /> Skills</h2>
          {editMode ? (
            <div className="skills-container">
              {form.skills.map((skill) => (
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
          ) : (
            <div className="skill-chips">
              {form.skills.length > 0
                ? form.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)
                : <span className="muted">No skills added yet.</span>}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

export default ApplicantProfile
