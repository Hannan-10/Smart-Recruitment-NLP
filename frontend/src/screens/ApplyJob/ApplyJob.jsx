import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSend, FiX, FiMapPin, FiClock, FiUsers, FiBriefcase } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import './ApplyJob.css'

function logoColor(name = '') {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 58%, 48%)`
}

function logoInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function ApplyJob() {
  const location = useLocation()
  const job = location.state?.job
  const { getAccessToken } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [cvFile, setCvFile] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!job) {
    return (
      <main className="dashboard-content apply-job-page">
        <div className="empty-selection">
          <h1>No job selected</h1>
          <p>Please choose a job from search, saved jobs, or applications to view details.</p>
        </div>
      </main>
    )
  }

  const jobId = job._id || job.id

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!cvFile) {
      alert('Please upload your CV in PDF, DOC, or DOCX format.')
      return
    }

    setSubmitting(true)
    try {
      const token = getAccessToken()
      if (token) {
        const formData = new FormData()
        formData.append('cv', cvFile)
        if (coverLetter.trim()) formData.append('coverLetter', coverLetter)

        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json()
          if (data.message !== 'Already applied to this job') {
            throw new Error(data.message || 'Failed to submit application')
          }
        }
      }

      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
      if (!appliedJobs.find((item) => (item._id || item.id) === jobId)) {
        appliedJobs.push({
          ...job,
          appliedAt: new Date().toISOString(),
          coverLetter,
          cvName: cvFile.name,
        })
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs))
      }

      setShowModal(false)
      setMessage(`You have successfully applied for ${job.title}.`)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="dashboard-content apply-job-page">
      <div className="job-details">
        <div className="job-header">
          {job.logo ? (
            <img src={job.logo} alt={`${job.company} logo`} className="company-logo" />
          ) : (
            <div
              className="company-logo company-logo--initials"
              style={{ background: logoColor(job.company || '') }}
            >
              {logoInitials(job.company || '')}
            </div>
          )}
          <div>
            <h1 className="job-title">{job.title}</h1>
            <p className="company-name">{job.company}</p>
          </div>
        </div>

        <div className="job-meta-grid">
          <div className="job-meta-item">
            <FiMapPin />
            <div>
              <span>Location</span>
              <strong>{job.location}</strong>
            </div>
          </div>
          <div className="job-meta-item">
            <FiClock />
            <div>
              <span>Type</span>
              <strong>{job.type}</strong>
            </div>
          </div>
          <div className="job-meta-item">
            <FiUsers />
            <div>
              <span>Employees</span>
              <strong>{job.employeeSize || '—'}</strong>
            </div>
          </div>
          <div className="job-meta-item">
            <FiBriefcase />
            <div>
              <span>Industry</span>
              <strong>{job.industry || job.category || '—'}</strong>
            </div>
          </div>
        </div>

        <div className="job-description">
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>

        {message ? <div className="success-banner">{message}</div> : null}

        {!message && (
          <button onClick={() => setShowModal(true)} className="detail-apply-btn" aria-label="Apply now">
            <FiSend />
          </button>
        )}
      </div>

      {showModal ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FiX />
            </button>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <p>Upload your CV and add a cover letter if you want.</p>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <label className="file-upload">
                <span>Upload CV</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files[0])}
                />
                {cvFile ? <small>{cvFile.name}</small> : <small>No file chosen</small>}
              </label>

              <label className="cover-letter">
                <span>Cover Letter (optional)</span>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're the best fit..."
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default ApplyJob
