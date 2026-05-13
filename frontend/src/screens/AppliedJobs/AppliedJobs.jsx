import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiMapPin, FiClock, FiBriefcase } from 'react-icons/fi'
import Loader from '../../components/Loader'
import { useAuth } from '../../context/AuthContext'
import './AppliedJobs.css'

const STATUS_STEPS = ['applied', 'shortlisted', 'interview', 'selected']

const STATUS_LABELS = {
  applied:     'Applied',
  shortlisted: 'Shortlisted',
  interview:   'Interview',
  selected:    'Selected',
  rejected:    'Rejected',
}

const STATUS_COLORS = {
  applied:     '#64748b',
  shortlisted: '#2563eb',
  interview:   '#f59e0b',
  selected:    '#10b981',
  rejected:    '#ef4444',
}

function StatusStepper({ status = 'applied' }) {
  const isRejected = status === 'rejected'
  const activeIndex = STATUS_STEPS.indexOf(status)

  if (isRejected) {
    return (
      <div className="status-rejected-bar">
        <span className="status-rejected-dot" />
        Application closed — not selected this time
      </div>
    )
  }

  return (
    <div className="status-stepper">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= activeIndex
        return (
          <div key={step} className={`step-item${done ? ' step-done' : ''}`}>
            <div className="step-circle" style={done ? { background: STATUS_COLORS[step === status ? status : 'selected'], borderColor: 'transparent' } : {}}>
              {done && i < activeIndex ? '✓' : i + 1}
            </div>
            <span className="step-label" style={step === status ? { color: STATUS_COLORS[status], fontWeight: 700 } : {}}>
              {STATUS_LABELS[step]}
            </span>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`step-connector${i < activeIndex ? ' step-connector--done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function logoColor(name = '') {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 58%, 48%)`
}
function logoInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function AppliedJobs() {
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()
  const [appliedJobs, setAppliedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAppliedJobs = useCallback(async () => {
    const token = getAccessToken()
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/jobs/applied', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setAppliedJobs(data)
          localStorage.setItem('appliedJobs', JSON.stringify(data))
          return
        }
      } catch {}
    }
    setAppliedJobs(JSON.parse(localStorage.getItem('appliedJobs') || '[]'))
  }, [getAccessToken])

  useEffect(() => {
    fetchAppliedJobs().finally(() => setLoading(false))
  }, [fetchAppliedJobs])

  const handleUnapply = async (job) => {
    const jobId = job._id || job.id
    const token = getAccessToken()
    if (token && jobId) {
      try {
        await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {}
    }
    const remaining = appliedJobs.filter((item) => (item._id || item.id) !== jobId)
    localStorage.setItem('appliedJobs', JSON.stringify(remaining))
    setAppliedJobs(remaining)
  }

  const handleView = (job) => {
    navigate('/applicant/apply-job', { state: { job } })
  }

  return (
    <main className="dashboard-content applied-page">
      <h1 className="dash-serif">Applications</h1>
      <p className="page-intro">Track where you stand with each role.</p>

      {loading && <Loader text="Loading applications…" />}

      {!loading && appliedJobs.length === 0 && (
        <p className="empty-state">No applications yet. Apply to a role to see it here.</p>
      )}

      <section className="applied-cards">
        {appliedJobs.map((job) => {
          const appStatus = job.applicationStatus || 'applied'
          const statusColor = STATUS_COLORS[appStatus] || '#64748b'

          return (
            <div
              key={job._id || job.id}
              className="applied-card"
              style={{ borderLeftColor: statusColor }}
              onClick={() => handleView(job)}
            >
              <div className="applied-card-top">
                <div className="applied-card-logo-area">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company} className="applied-card-logo" />
                  ) : (
                    <div className="applied-card-logo applied-card-logo--initials" style={{ background: logoColor(job.company || '') }}>
                      {logoInitials(job.company || '')}
                    </div>
                  )}
                  <div>
                    <h3 className="applied-card-title">{job.title}</h3>
                    <p className="applied-card-company">{job.company}</p>
                  </div>
                </div>

                <div className="applied-card-meta">
                  {job.location && <span><FiMapPin /> {job.location}</span>}
                  {job.type && <span><FiBriefcase /> {job.type}</span>}
                  {job.appliedAt && (
                    <span><FiClock /> Applied {new Date(job.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  )}
                </div>
              </div>

              <StatusStepper status={appStatus} />

              <div className="applied-card-footer" onClick={(e) => e.stopPropagation()}>
                <span
                  className="applied-status-badge"
                  style={{ background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}40` }}
                >
                  {STATUS_LABELS[appStatus] || 'Applied'}
                </span>
                <button
                  className="btn-unapply"
                  onClick={() => handleUnapply(job)}
                  title="Withdraw application"
                >
                  <FiTrash2 /> Withdraw
                </button>
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}

export default AppliedJobs
