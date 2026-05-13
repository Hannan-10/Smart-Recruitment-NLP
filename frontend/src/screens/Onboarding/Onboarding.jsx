import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import LocationPicker from '../../components/LocationPicker'
import ImageCropper from '../../components/ImageCropper'
import { images } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import {
  setNeedOnboarding,
  setProfile,
  getSignupMeta,
  clearSignupMeta,
  needsOnboarding,
} from '../../utils/signupFlow'
import './Onboarding.css'

const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-7 years',
  '7-10 years',
  '10+ years',
]

const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-300',
  '301-1000',
  '1000-5000',
  '5000+',
]

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

function Onboarding() {
  const { currentUser, getAccessToken } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const isRecruiter = currentUser?.role === 'recruiter'
  const totalSteps = isRecruiter ? 4 : 4

  const [form, setForm] = useState({
    // Applicant fields
    bio: '',
    experience: '',
    skills: [],
    skillInput: '',
    // Recruiter fields
    companyName: '',
    companySize: '',
    industry: '',
    location: '',
    // Shared fields
    photoPreview: null,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cropSrc, setCropSrc] = useState(null)

  useEffect(() => {
    if (!needsOnboarding()) {
      const target = isRecruiter ? '/recruiter/dashboard' : '/applicant/jobs'
      navigate(target, { replace: true })
    }
  }, [navigate, isRecruiter])

  if (!currentUser) {
    navigate('/signin', { replace: true })
    return null
  }

  const progress = (step / totalSteps) * 100

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
    // reset input so re-selecting the same file still fires onChange
    e.target.value = ''
  }

  const addSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = form.skillInput.trim()
      if (!val) return

      if (!form.skills.includes(val)) {
        setForm((p) => ({
          ...p,
          skills: [...p.skills, val],
          skillInput: '',
        }))
      }
    }
  }

  const removeSkill = (skill) => {
    setForm((p) => ({
      ...p,
      skills: p.skills.filter((s) => s !== skill),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isRecruiter) {
      if (!form.companyName || !form.companySize || !form.industry || !form.location) {
        setError('Please complete all required fields')
        return
      }
    } else {
      if (!form.bio || !form.experience || form.skills.length === 0 || !form.location) {
        setError('Please complete all required fields')
        return
      }
    }

    setError('')
    setLoading(true)

    try {
      const endpoint = isRecruiter ? '/api/onboarding/recruiter' : '/api/onboarding/applicant'
      const payload = isRecruiter
        ? {
            companyName: form.companyName,
            companySize: form.companySize,
            industry: form.industry,
            location: form.location,
            photo: form.photoPreview || undefined,
          }
        : {
            bio: form.bio,
            experience: form.experience,
            skills: form.skills,
            location: form.location,
            photo: form.photoPreview || undefined,
          }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Onboarding failed')
      }

      const meta = getSignupMeta()

      setProfile({
        email: currentUser.email,
        firstName: meta?.firstName,
        lastName: meta?.lastName,
        ...form,
      })

      clearSignupMeta()
      setNeedOnboarding(false)

      navigate(isRecruiter ? '/recruiter/dashboard' : '/applicant/jobs')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={isRecruiter ? 'Setup Your Company' : 'Complete Your Profile'}
      subtitle={isRecruiter ? 'Tell us about your organization' : 'Let recruiters discover you faster'}
      panelTitle={isRecruiter ? 'Recruit the Best' : 'Build your identity'}
      panelSubtitle={isRecruiter ? 'Complete profiles help attract top talent' : 'Profiles with complete details get higher visibility'}
      panelImage={images.SignInImg}
      panelSide="left"
    >
      <div className="onb-container">

        {/* HEADER */}
        <div className="onb-header">
          <h2>{isRecruiter ? 'Company Setup' : 'Profile Setup'}</h2>
          <p>Step {step} of {totalSteps}</p>

          <div className="onb-progress">
            <div style={{ width: `${progress}%` }} />
          </div>

          <span className="progress-text">{Math.round(progress)}% complete</span>
        </div>

        {/* FORM */}
        <form className="onb-form" onSubmit={handleSubmit}>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="fade">
              <label className="label">{isRecruiter ? 'Company Logo' : 'Profile Photo'}</label>

              <label className="photo-drop photo-drop--circle">
                {form.photoPreview ? (
                  <img src={form.photoPreview} alt="preview" className="photo-preview-circle" />
                ) : (
                  <div className="photo-empty">
                    <span>+</span>
                    <p>{isRecruiter ? 'Upload Logo' : 'Upload Photo'}</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhoto} hidden />
              </label>
              {form.photoPreview && (
                <label className="photo-repick">
                  Change photo
                  <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                </label>
              )}

              {isRecruiter ? (
                <>
                  <label className="label">Company Name</label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, companyName: e.target.value }))
                    }
                  />
                </>
              ) : (
                <>
                  <label className="label">Bio</label>
                  <textarea
                    placeholder="Write a short professional bio..."
                    value={form.bio}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bio: e.target.value }))
                    }
                  />
                </>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="fade">
              {isRecruiter ? (
                <>
                  <label className="label">Company Size</label>
                  <div className="pill-grid">
                    {COMPANY_SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`pill ${
                          form.companySize === opt ? 'active' : ''
                        }`}
                        onClick={() =>
                          setForm((p) => ({ ...p, companySize: opt }))
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <label className="label">Experience Level</label>
                  <div className="pill-grid">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`pill ${
                          form.experience === opt ? 'active' : ''
                        }`}
                        onClick={() =>
                          setForm((p) => ({ ...p, experience: opt }))
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="fade">
              {isRecruiter ? (
                <>
                  <label className="label">Industry</label>
                  <select
                    className="onb-select"
                    value={form.industry}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, industry: e.target.value }))
                    }
                  >
                    <option value="" disabled>Select Industry</option>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="label">Skills</label>
                  <input
                    value={form.skillInput}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        skillInput: e.target.value,
                      }))
                    }
                    onKeyDown={addSkill}
                    placeholder="Type skill & press Enter"
                  />

                  <div className="chips">
                    {form.skills.map((s) => (
                      <span key={s} onClick={() => removeSkill(s)}>
                        {s} ✕
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="fade">
              {isRecruiter ? (
                <>
                  <label className="label">Company Location</label>
                  <LocationPicker
                    value={form.location}
                    onChange={(val) => setForm((p) => ({ ...p, location: val }))}
                  />
                </>
              ) : (
                <>
                  <label className="label">Location</label>
                  <LocationPicker
                    value={form.location}
                    onChange={(val) => setForm((p) => ({ ...p, location: val }))}
                  />
                </>
              )}
            </div>
          )}

          {error && <p className="error">{error}</p>}

          {/* BUTTONS */}
          <div className="btn-row">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button type="button" onClick={() => setStep(step + 1)}>
                Next
              </button>
            ) : (
              <button type="submit" disabled={loading}>
                {loading ? 'Setting up...' : 'Finish Setup'}
              </button>
            )}
          </div>

        </form>
      </div>
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCrop={(dataUrl) => {
            setForm((p) => ({ ...p, photoPreview: dataUrl }))
            setCropSrc(null)
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </AuthLayout>
  )
}

export default Onboarding