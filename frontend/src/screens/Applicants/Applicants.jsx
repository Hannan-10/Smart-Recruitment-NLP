import { useState, useMemo } from 'react'
import { recruiterJobs, applicants } from '../../data/mockData'
import { FiBriefcase, FiMapPin, FiUsers, FiArrowUp, FiDownload, FiX, FiSearch, FiFilter } from 'react-icons/fi'
import './Applicants.css'

function Applicants() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [cvSearch, setCvSearch] = useState('')
  const [sortedApplicants, setSortedApplicants] = useState(null)

  // Mock: Get applicants for a job
  const getApplicantsForJob = (jobId) => {
    // In a real app, this would be an API call
    const jobApps = applicants.filter((app) => app.jobId === jobId || !app.jobId).slice(0, 15)
    return jobApps.map(app => ({
      ...app,
      relevanceScore: Math.floor(Math.random() * 40) + 60, // Mock relevance score
      skills: app.skills || ['React', 'Node.js', 'TypeScript', 'UI Design'].sort(() => 0.5 - Math.random()).slice(0, 3)
    }))
  }

  const handleViewApplicants = (job) => {
    const jobApplicants = getApplicantsForJob(job.id)
    setSelectedJob(job)
    setSortedApplicants(jobApplicants)
    setCvSearch('')
  }

  const handleSortTopCVs = () => {
    if (!sortedApplicants) return
    const top = [...sortedApplicants].sort((a, b) => b.relevanceScore - a.relevanceScore)
    setSortedApplicants(top)
    alert('CVs sorted by AI relevance score')
  }

  const handleCloseCVs = () => {
    setSelectedJob(null)
    setSortedApplicants(null)
  }

  const filteredApplicants = useMemo(() => {
    if (!sortedApplicants) return []
    return sortedApplicants.filter(app => 
      app.name.toLowerCase().includes(cvSearch.toLowerCase()) ||
      (app.email && app.email.toLowerCase().includes(cvSearch.toLowerCase()))
    )
  }, [sortedApplicants, cvSearch])

  return (
    <main className="dashboard-content applicants-page">
      {!selectedJob ? (
        <>
          {/* HEADER */}
          <div className="applicants-header">
            <h1 className="dash-serif">Applicant Management</h1>
            <p>Review and manage candidates for your posted positions.</p>
          </div>

          {/* JOBS LIST */}
          <div className="jobs-list-grid">
            {recruiterJobs.map((job) => (
              <div key={job.id} className="job-item-card">
                <div className="job-item-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-company"><FiBriefcase /> {job.company}</p>
                  </div>
                  <span className="job-type-badge">{job.type}</span>
                </div>

                <div className="job-item-details">
                  <p className="job-location">
                    <FiMapPin /> {job.location}
                  </p>
                  <p className="applicants-count">
                    <FiUsers /> 15 Applications
                  </p>
                </div>

                <button
                  onClick={() => handleViewApplicants(job)}
                  className="btn-view-applicants"
                >
                  Review Applications
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* CVS VIEW */}
          <div className="cvs-view">
            <div className="cvs-header-container">
              <div className="cvs-header-main">
                <button className="btn-back" onClick={handleCloseCVs}>
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
                    placeholder="Search candidates..." 
                    value={cvSearch}
                    onChange={(e) => setCvSearch(e.target.value)}
                  />
                </div>
                <button onClick={handleSortTopCVs} className="btn-sort-top">
                  <FiArrowUp /> Rank by AI Relevance
                </button>
              </div>
            </div>

            {/* APPLICANTS CVS */}
            <div className="applicants-cvs-list">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant, index) => (
                  <div key={applicant.id} className="cv-item">
                    <div className="cv-rank-badge">
                      <span className="rank-num">{index + 1}</span>
                      <span className="rank-label">Rank</span>
                    </div>
                    <div className="cv-content">
                      <div className="cv-info-main">
                        <div className="cv-user-info">
                          <h4>{applicant.name}</h4>
                          <p className="cv-email">{applicant.email || 'candidate@example.com'}</p>
                        </div>
                        <div className="cv-metrics">
                          <div className="metric">
                            <span className="metric-label">AI Match Score</span>
                            <div className="relevance-bar">
                              <div 
                                className="relevance-fill" 
                                style={{ width: `${applicant.relevanceScore}%` }}
                              ></div>
                              <span className="relevance-text">{applicant.relevanceScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="cv-footer">
                        <div className="cv-tags">
                          {applicant.skills.map((skill, i) => (
                            <span key={i} className="cv-tag">{skill}</span>
                          ))}
                        </div>
                        <button className="btn-download-cv">
                          <FiDownload /> Download CV
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No candidates found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default Applicants
