import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import LocationPicker from '../../components/LocationPicker'
import { images } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import { getProfile, setProfile } from '../../utils/signupFlow'
import './EditProfile.css'

const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
]

function EditProfile() {
  const { currentUser } = useAuth()
  const existing = getProfile() || {}
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: existing.firstName || '',
    lastName: existing.lastName || '',
    bio: existing.bio || '',
    experience: existing.experience || '',
    skills: existing.skills || '',
    location: existing.location || '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setProfile({
      ...existing,
      ...form,
      email: existing.email || currentUser?.email || '',
    })
    navigate('/applicant/profile')
  }

  return (
    <AuthLayout
      title="Edit profile"
      subtitle="Update the details you added during onboarding."
      panelTitle="Stay current"
      panelSubtitle="Keep your profile fresh so opportunities match you better."
      panelAction={<Link to="/applicant/settings">Back to settings</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <textarea name="bio" rows={3} placeholder="Bio" value={form.bio} onChange={handleChange} />

        <div className="field-group">
          <label className="field-label">Experience Level</label>
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
        </div>

        <textarea name="skills" rows={3} placeholder="Skills" value={form.skills} onChange={handleChange} />

        <div className="field-group">
          <label className="field-label">Location</label>
          <LocationPicker
            value={form.location}
            onChange={(val) => setForm((prev) => ({ ...prev, location: val }))}
          />
        </div>

        <div className="edit-actions">
          <button type="submit" className="btn-auth-primary">
            Save changes
          </button>
          <Link to="/applicant/profile" className="btn-auth-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default EditProfile
