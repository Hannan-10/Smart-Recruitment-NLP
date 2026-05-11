import { useState, useEffect, useCallback } from 'react'
import { FiUser, FiBriefcase, FiEdit, FiSave, FiCamera, FiMapPin, FiUsers } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { getProfile, setProfile } from '../../utils/signupFlow'
import LocationPicker from '../../components/LocationPicker'
import '../ApplicantProfile/ApplicantProfile.css'

const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-300', '301-1000', '1000-5000', '5000+']

const INDUSTRY_OPTIONS = [
  'IT & Software',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Manufacturing',
  'Retail',
  'Other',
]

function RecruiterProfile() {
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
    companyName: savedProfile.companyName || '',
    companySize: savedProfile.companySize || '',
    industry: savedProfile.industry || '',
    location: savedProfile.location || '',
  })

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
        companyName: data.companyName || savedProfile.companyName || '',
        companySize: data.companySize || savedProfile.companySize || '',
        industry: data.industry || savedProfile.industry || '',
        location: data.location || savedProfile.location || '',
        photoPreview: savedProfile.photoPreview || '',
      }
      setProfileData(merged)
      setForm({
        firstName: merged.firstName,
        lastName: merged.lastName,
        companyName: merged.companyName,
        companySize: merged.companySize,
        industry: merged.industry,
        location: merged.location,
      })
      setProfile(merged)
    } catch {}
    finally { setLoading(false) }
  }, [getAccessToken])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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
      const res = await fetch('http://localhost:5000/api/onboarding/recruiter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(form),
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
      companyName: profileData.companyName || '',
      companySize: profileData.companySize || '',
      industry: profileData.industry || '',
      location: profileData.location || '',
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
            {profileData.companyName && (
              <div className="profile-chip">
                <FiBriefcase />
                <span>{profileData.companyName}</span>
              </div>
            )}
            {profileData.location && (
              <div className="profile-chip">
                <FiMapPin />
                <span>{profileData.location}</span>
              </div>
            )}
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
          <h2><FiBriefcase /> Company</h2>
          {editMode ? (
            <input name="companyName" placeholder="e.g. Tech Corp" value={form.companyName} onChange={handleChange} className="edit-input edit-input--full" />
          ) : (
            <p>{profileData.companyName || 'No company added.'}</p>
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

        <section className="info-card">
          <h2><FiUsers /> Company Size</h2>
          {editMode ? (
            <div className="exp-pill-grid">
              {COMPANY_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`exp-pill${form.companySize === opt ? ' active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, companySize: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <p>{profileData.companySize || 'Not specified.'}</p>
          )}
        </section>

        <section className="info-card">
          <h2><FiUser /> Industry</h2>
          {editMode ? (
            <select
              className="edit-input edit-input--full"
              value={form.industry}
              onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
            >
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <p>{profileData.industry || 'Not specified.'}</p>
          )}
        </section>

      </div>
    </main>
  )
}

export default RecruiterProfile
