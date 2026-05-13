import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiBriefcase, FiMapPin, FiUsers, FiDollarSign, FiFileText,
  FiEdit, FiSave, FiTrash2, FiArrowLeft, FiList, FiCalendar, FiX, FiTag,
} from 'react-icons/fi'
import Loader from '../../components/Loader'
import './RecruiterJobDetail.css'

const JOB_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
  { label: 'Internship', value: 'internship' },
]

const TYPE_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  remote: 'Remote',
  internship: 'Internship',
}

function RecruiterJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [requirementsText, setRequirementsText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`)
      if (!res.ok) throw new Error('Job not found')
      const data = await res.json()
      setJob(data)
      setForm({
        title: data.title,
        company: data.company,
        location: data.location,
        salary: data.salary || '',
        type: data.type,
        category: data.category || '',
        description: data.description,
      })
      setRequirementsText((data.requirements || []).join('\n'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchJob() }, [fetchJob])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setSaveError('')
    setSaving(true)
    const requirements = requirementsText.split('\n').map((r) => r.trim()).filter(Boolean)
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ ...form, requirements }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')
      setJob(data)
      setRequirementsText((data.requirements || []).join('\n'))
      setEditMode(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || '',
      type: job.type,
      category: job.category || '',
      description: job.description,
    })
    setRequirementsText((job.requirements || []).join('\n'))
    setSaveError('')
    setEditMode(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Delete failed')
      }
      navigate('/recruiter/dashboard')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return (
    <main className="dashboard-content jd-page">
      <Loader text="Loading job…" size="lg" />
    </main>
  )

  if (error && !job) return (
    <main className="dashboard-content jd-page">
      <p className="jd-error">{error}</p>
      <button className="jd-back-btn" onClick={() => navigate('/recruiter/dashboard')}>
        <FiArrowLeft /> Back to Dashboard
      </button>
    </main>
  )

  const postedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <main className="dashboard-content jd-page">

      {/* BACK */}
      <button className="jd-back-btn" onClick={() => navigate('/recruiter/dashboard')}>
        <FiArrowLeft /> Back to Dashboard
      </button>

      {/* HERO */}
      <div className="jd-hero">
        <div className="jd-hero-left">
          <div className="jd-title-row">
            {editMode ? (
              <input name="title" value={form.title} onChange={handleChange} className="jd-title-input" placeholder="Job Title" />
            ) : (
              <h1 className="jd-title">{job.title}</h1>
            )}
            {editMode ? (
              <select name="type" value={form.type} onChange={handleChange} className="jd-type-select">
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            ) : (
              <span className="jd-type-badge">{TYPE_LABELS[job.type] || job.type}</span>
            )}
          </div>

          <div className="jd-meta-row">
            <span className="jd-meta-item">
              <FiBriefcase />
              {editMode
                ? <input name="company" value={form.company} onChange={handleChange} className="jd-inline-input" placeholder="Company" />
                : job.company}
            </span>
            <span className="jd-meta-item">
              <FiMapPin />
              {editMode
                ? <input name="location" value={form.location} onChange={handleChange} className="jd-inline-input" placeholder="Location" />
                : job.location}
            </span>
            {(job.salary || editMode) && (
              <span className="jd-meta-item">
                <FiDollarSign />
                {editMode
                  ? <input name="salary" value={form.salary} onChange={handleChange} className="jd-inline-input" placeholder="e.g. $80k–$100k" />
                  : job.salary}
              </span>
            )}
            {(job.category || editMode) && (
              <span className="jd-meta-item">
                <FiTag />
                {editMode ? (
                  <select name="category" value={form.category} onChange={handleChange} className="jd-inline-select">
                    <option value="">No category</option>
                    {['Technology','Design','Marketing','Finance','Operations','Healthcare','Education','Sales','Other'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : job.category}
              </span>
            )}
            <span className="jd-meta-item">
              <FiCalendar />
              Posted {postedDate}
            </span>
            <span className="jd-meta-item">
              <FiUsers />
              {job.applicants?.length || 0} applicant{job.applicants?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="jd-hero-actions">
          {editMode ? (
            <>
              <button className="jd-btn-save" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="jd-btn-cancel" onClick={cancelEdit}>
                <FiX /> Cancel
              </button>
            </>
          ) : (
            <>
              <button className="jd-btn-edit" onClick={() => setEditMode(true)}>
                <FiEdit /> Edit Job
              </button>
              <button className="jd-btn-delete" onClick={() => setConfirmDelete(true)}>
                <FiTrash2 /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && <p className="jd-save-error">{saveError}</p>}

      {/* CARDS */}
      <div className="jd-grid">
        <section className="jd-card jd-card--wide">
          <h2><FiFileText /> Job Description</h2>
          {editMode ? (
            <textarea name="description" value={form.description} onChange={handleChange} className="jd-textarea" rows={8} placeholder="Job description…" />
          ) : (
            <p>{job.description}</p>
          )}
        </section>

        {(job.requirements?.length > 0 || editMode) && (
          <section className="jd-card jd-card--wide">
            <h2><FiList /> Requirements</h2>
            {editMode ? (
              <>
                <p className="jd-hint">One requirement per line</p>
                <textarea value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} className="jd-textarea" rows={5} placeholder={"3+ years React experience\nStrong TypeScript skills"} />
              </>
            ) : (
              <ul className="jd-requirements">
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {confirmDelete && (
        <div className="jd-modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="jd-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Job Posting?</h2>
            <p>This will permanently remove <strong>{job.title}</strong>. This action cannot be undone.</p>
            <div className="jd-modal-actions">
              <button className="jd-btn-cancel" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="jd-btn-confirm-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default RecruiterJobDetail
