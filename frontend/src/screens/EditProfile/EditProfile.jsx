import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import { getProfile, setProfile } from '../../utils/signupFlow'
import './EditProfile.css'

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
        <textarea
          name="experience"
          rows={4}
          placeholder="Experience"
          value={form.experience}
          onChange={handleChange}
        />
        <textarea name="skills" rows={3} placeholder="Skills" value={form.skills} onChange={handleChange} />
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
