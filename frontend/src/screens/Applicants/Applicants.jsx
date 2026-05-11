import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  FiBriefcase, FiMapPin, FiUsers, FiArrowUp, FiDownload,
  FiX, FiSearch, FiFileText, FiAlertCircle,
} from 'react-icons/fi'
import './Applicants.css'

function Applicants() {
  const { getAccessToken } = useAuth()

  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)

  const [selectedJob, setSelectedJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appsError, setAppsError] = useState('')

  const [cvSearch, setCvSearch] = useState('')
  const [sorted, setSorted] = useState(false)

  const [coverLetterModal, setCoverLetterModal] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs/my', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) throw new Error()
      setJobs(await res.json())
    } catch {
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => { fetchMyJobs() }, [fetchMyJobs])

  const handleViewApplicants = useCallback(async (job) => {
    setSelectedJob(job)
    setApplications([])
    setAppsError('')
    setSorted(false)
    setCvSearch('')
    setAppsLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${job._id}/applicants`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load applicants')
      const data = await res.json()
      setApplications(data)
    } catch (err) {
      setAppsError(err.message)
    } finally {
      setAppsLoading(false)
    }
  }, [getAccessToken])

  const handleSortTopCVs = () => {
    setApplications((prev) =>
      [...prev].sort((a, b) => {
        const scoreA = a.applicant?.skills?.length || 0
        const scoreB = b.applicant?.skills?.length || 0
        return scoreB - scoreA
      })
    )
    setSorted(true)
  }

  const handleDownloadCV = async (app) => {
    if (!app.cvPath && !app.cvOriginalName) {
      alert('No CV uploaded for this applicant.')
      return
    }
    setDownloadingId(app._id)
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${app._id}/cv`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) {
        alert('CV not available.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = app.cvOriginalName || 'cv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download CV.')
    } finally {
      setDownloadingId(null)
    }
  }

  const displayedApps = useMemo(() => {
    const q = cvSearch.toLowerCase()
    return applications.filter((app) => {
      const name = `${app.applicant?.firstName || ''} ${app.applicant?.lastName || ''}`.toLowerCase()
      const email = (app.applicant?.email || '').toLowerCase()
      return !q || name.includes(q) || email.includes(q)
    })
  }, [applications, cvSearch])

  return (
    <main className="dashboard-content applicants-page">
      {!selectedJob ? (
        <>
          <div className="applicants-header">
            <h1 className="dash-serif">Applicant Management</h1>
            <p>Review and manage candidates for your posted positions.</p>
          </div>

          {jobsLoading && <p style={{ color: '#64748b' }}>Loading jobs…</p>}

          {!jobsLoading && jobs.length === 0 && (
            <p style={{ color: '#94a3b8' }}>No jobs posted yet.</p>
          )}

          <div className="jobs-list-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-item-card">
                <div className="job-item-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-company"><FiBriefcase /> {job.company}</p>
                  </div>
                  <span className="job-type-badge">{job.type}</span>
                </div>

                <div className="job-item-details">
                  <p className="job-location"><FiMapPin /> {job.location}</p>
                  <p className="applicants-count">
                    <FiUsers /> {job.applicants?.length ?? 0} Application{job.applicants?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <button onClick={() => handleViewApplicants(job)} className="btn-view-applicants">
                  Review Applications
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="cvs-view">
          {/* HEADER */}
          <div className="cvs-header-container">
            <div className="cvs-header-main">
              <button className="btn-back" onClick={() => setSelectedJob(null)}>
                <FiX />
              </button>
              <div className="cvs-title-info">
                <h2>{selectedJob.title}</h2>
                <p>{selectedJob.company} • {selectedJob.location}</p>
              </div>
            </div>

            <div className="cvs-actions">
              <div className="cv-search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search candidates…"
                  value={cvSearch}
                  onChange={(e) => setCvSearch(e.target.value)}
                />
              </div>
              <button onClick={handleSortTopCVs} className={`btn-sort-top${sorted ? ' sorted' : ''}`}>
                <FiArrowUp /> {sorted ? 'Sorted by Skills' : 'Rank by Skills'}
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="applicants-cvs-list">
            {appsLoading && <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>Loading applicants…</p>}

            {!appsLoading && appsError && (
              <div className="no-results">
                <FiAlertCircle style={{ fontSize: 24, color: '#dc2626', marginBottom: 8 }} />
                <p>{appsError}</p>
              </div>
            )}

            {!appsLoading && !appsError && displayedApps.length === 0 && (
              <div className="no-results">
                <p>{cvSearch ? 'No candidates match your search.' : 'No applications yet for this job.'}</p>
              </div>
            )}

            {displayedApps.map((app, index) => {
              const applicant = app.applicant || {}
              const name = `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown'
              const skills = Array.isArray(applicant.skills) ? applicant.skills : []

              return (
                <div key={app._id} className="cv-item">
                  <div className="cv-rank-badge">
                    <span className="rank-num">{index + 1}</span>
                    <span className="rank-label">Rank</span>
                  </div>

                  <div className="cv-content">
                    <div className="cv-info-main">
                      <div className="cv-user-info">
                        <h4>{name}</h4>
                        <p className="cv-email">{applicant.email || '—'}</p>
                        {applicant.experience && (
                          <p className="cv-experience">{applicant.experience} experience</p>
                        )}
                        {applicant.location && (
                          <p className="cv-location"><FiMapPin /> {applicant.location}</p>
                        )}
                      </div>

                      {applicant.bio && (
                        <p className="cv-bio">{applicant.bio}</p>
                      )}
                    </div>

                    <div className="cv-footer">
                      <div className="cv-tags">
                        {skills.length > 0
                          ? skills.map((s, i) => <span key={i} className="cv-tag">{s}</span>)
                          : <span className="cv-tag cv-tag--muted">No skills listed</span>}
                      </div>

                      <div className="cv-actions">
                        {app.coverLetter && (
                          <button
                            className="btn-cover-letter"
                            onClick={() => setCoverLetterModal(app)}
                            title="View cover letter"
                          >
                            <FiFileText /> Cover Letter
                          </button>
                        )}
                        <button
                          className="btn-download-cv"
                          onClick={() => handleDownloadCV(app)}
                          disabled={downloadingId === app._id}
                          title={app.cvOriginalName ? `Download ${app.cvOriginalName}` : 'No CV uploaded'}
                        >
                          <FiDownload />
                          {downloadingId === app._id ? 'Downloading…' : 'Download CV'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* COVER LETTER MODAL */}
      {coverLetterModal && (
        <div className="cl-backdrop" onClick={() => setCoverLetterModal(null)}>
          <div className="cl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h3>Cover Letter</h3>
              <button className="cl-close" onClick={() => setCoverLetterModal(null)}><FiX /></button>
            </div>
            <p className="cl-applicant-name">
              {`${coverLetterModal.applicant?.firstName || ''} ${coverLetterModal.applicant?.lastName || ''}`.trim()}
            </p>
            <div className="cl-body">{coverLetterModal.coverLetter}</div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Applicants
