import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  FiBriefcase, FiMapPin, FiUsers, FiArrowUp, FiDownload,
  FiX, FiSearch, FiFileText, FiAlertCircle, FiCpu,
} from 'react-icons/fi'
import Loader from '../../components/Loader'
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
        if (a.aiScore == null && b.aiScore == null) return 0
        if (a.aiScore == null) return 1
        if (b.aiScore == null) return -1
        return b.aiScore - a.aiScore
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

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setApplications((prev) =>
        prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a)
      )
    } catch {
      alert('Failed to update status.')
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

          {jobsLoading && <Loader text="Loading jobs…" />}

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
            </div>
          </div>

          {/* LIST */}
          <div className="applicants-cvs-list">
            {appsLoading && <Loader text="Loading applicants…" size="lg" />}

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
              const hasScore = app.aiScore !== null && app.aiScore !== undefined
              const scoreColor = !hasScore ? '#94a3b8'
                : app.aiScore >= 75 ? '#10b981'
                : app.aiScore >= 50 ? '#f59e0b'
                : '#ef4444'

              return (
                <div key={app._id} className="cv-item">
                  {/* RANK BADGE */}
                  <div className="cv-rank-badge" style={{ borderColor: scoreColor }}>
                    <span className="rank-num" style={{ color: scoreColor }}>{index + 1}</span>
                    <span className="rank-label">Rank</span>
                  </div>

                  <div className="cv-content">
                    {/* TOP ROW: info + AI score */}
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

                      {/* AI SCORE PANEL */}
                      <div className="ai-score-panel">
                        <div className="ai-score-header">
                          <FiCpu className="ai-icon" />
                          <span className="ai-label">AI Match Score</span>
                        </div>

                        {hasScore ? (
                          <>
                            <div className="ai-score-big" style={{ color: scoreColor }}>
                              {app.aiScore}%
                            </div>
                            <div className="ai-score-bar-wrap">
                              <div
                                className="ai-score-bar-fill"
                                style={{ width: `${app.aiScore}%`, background: scoreColor }}
                              />
                            </div>

                            {app.aiBreakdown && (
                              <div className="ai-breakdown">
                                <div className="breakdown-row">
                                  <span>Semantic</span>
                                  <div className="mini-bar">
                                    <div style={{ width: `${app.aiBreakdown.semantic}%` }} />
                                  </div>
                                  <span className="breakdown-val">{app.aiBreakdown.semantic}%</span>
                                </div>
                                <div className="breakdown-row">
                                  <span>Skill Match</span>
                                  <div className="mini-bar">
                                    <div style={{ width: `${app.aiBreakdown.skill_match}%` }} />
                                  </div>
                                  <span className="breakdown-val">{app.aiBreakdown.skill_match}%</span>
                                </div>
                                <div className="breakdown-row">
                                  <span>Experience</span>
                                  <div className="mini-bar">
                                    <div style={{ width: `${app.aiBreakdown.experience}%` }} />
                                  </div>
                                  <span className="breakdown-val">{app.aiBreakdown.experience}%</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="ai-score-na">
                            {appsLoading ? 'Scoring…' : 'N/A — no CV or service offline'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* BIO */}
                    {applicant.bio && <p className="cv-bio">{applicant.bio}</p>}

                    {/* FOOTER: skills + actions */}
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

                        <select
                          className={`app-status-select app-status-select--${app.status || 'applied'}`}
                          value={app.status || 'applied'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          title="Update applicant status"
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
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
