import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSend, FiX, FiMapPin, FiClock, FiUsers, FiBriefcase } from 'react-icons/fi'
import './ApplyJob.css'

function ApplyJob() {
  const location = useLocation()
  const job = location.state?.job
  const [showModal, setShowModal] = useState(false)
  const [cvFile, setCvFile] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [message, setMessage] = useState('')

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

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!cvFile) {
      alert('Please upload your CV in PDF, DOC, or DOCX format.')
      return
    }

    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
    if (!appliedJobs.find((item) => item.id === job.id)) {
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
  }

  return (
      <main className="dashboard-content apply-job-page">
        <div className="job-details">
          <div className="job-header">
            <img src={job.logo} alt={`${job.company} logo`} className="company-logo" />
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
                <strong>{job.employeeSize}</strong>
              </div>
            </div>
            <div className="job-meta-item">
              <FiBriefcase />
              <div>
                <span>Industry</span>
                <strong>{job.industry}</strong>
              </div>
            </div>
          </div>

          <div className="job-description">
            <h2>Description</h2>
            <p>{job.description}</p>
          </div>

          {message ? <div className="success-banner">{message}</div> : null}

          <button onClick={() => setShowModal(true)} className="detail-apply-btn" aria-label="Apply now">
            <FiSend />
          </button>
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
                    placeholder="Tell the recruiter why you’re the best fit..."
                  />
                </label>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Submit Application
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
