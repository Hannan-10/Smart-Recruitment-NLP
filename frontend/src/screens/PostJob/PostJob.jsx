import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProfile } from '../../utils/signupFlow'
import { FiBriefcase, FiMapPin, FiFileText, FiDollarSign, FiCheck, FiList } from 'react-icons/fi'
import './PostJob.css'

const JOB_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
  { label: 'Internship', value: 'internship' },
]

const CATEGORIES = [
  'Technology', 'Design', 'Marketing', 'Finance',
  'Operations', 'Healthcare', 'Education', 'Sales', 'Other',
]

function PostJob() {
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()
  const profile = getProfile() || {}

  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requirementsText, setRequirementsText] = useState('')

  const [form, setForm] = useState({
    title: '',
    company: profile.companyName || '',
    location: profile.location || '',
    salary: '',
    type: 'full-time',
    category: '',
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)

    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ ...form, requirements }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to post job')

      setShowSuccess(true)
      setForm({ title: '', company: profile.companyName || '', location: profile.location || '', salary: '', type: 'full-time', category: '', description: '' })
      setRequirementsText('')
      setTimeout(() => navigate('/recruiter/dashboard'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="dashboard-content post-job-page">
      {showSuccess && (
        <div className="success-banner">
          <div className="success-content">
            <FiCheck className="success-icon" />
            <div>
              <h3>Job Posted Successfully!</h3>
              <p>Your job posting is now live. Redirecting to dashboard…</p>
            </div>
          </div>
        </div>
      )}

      <div className="post-header">
        <h1 className="dash-serif">Post a New Job</h1>
        <p>Create an attractive job listing to attract qualified candidates.</p>
      </div>

      <form onSubmit={handleSubmit} className="job-form-modern">
        <div className="form-section">
          <h2>Job Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><FiBriefcase /> Job Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Senior Frontend Developer" required />
            </div>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="job-type-select">
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><FiBriefcase /> Company</label>
              <input name="company" value={form.company} onChange={handleChange} placeholder="e.g., Tech Company Inc." required />
            </div>
            <div className="form-group">
              <label className="form-label"><FiMapPin /> Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g., New York, NY" required />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label"><FiDollarSign /> Salary (optional)</label>
            <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g., $80,000 – $100,000 / year" />
          </div>

          <div className="form-group full-width">
            <label className="form-label"><FiBriefcase /> Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="job-type-select">
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label"><FiFileText /> Job Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what makes your company great…"
              rows={7}
              required
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label"><FiList /> Requirements (one per line, optional)</label>
            <textarea
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder={"3+ years of React experience\nStrong TypeScript skills\nExperience with REST APIs"}
              rows={4}
            />
          </div>
        </div>

        {error && <p className="post-error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/recruiter/dashboard')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish Job'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default PostJob
