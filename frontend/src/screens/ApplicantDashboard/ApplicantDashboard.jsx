import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import JobCard from '../../components/JobCard'
import { applicantJobs } from '../../data/mockData'
import './ApplicantDashboard.css'

function ApplicantDashboard() {
  const navigate = useNavigate()

  const [savedJobs, setSavedJobs] = useState(
    JSON.parse(localStorage.getItem('savedJobs') || '[]')
  )
  const savedIds = new Set(savedJobs.map((item) => item.id))

  const handleSave = (job) => {
    const currentSaved = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    const alreadySaved = currentSaved.some((item) => item.id === job.id)
    let updated
    if (alreadySaved) {
      updated = currentSaved.filter((item) => item.id !== job.id)
      localStorage.setItem('savedJobs', JSON.stringify(updated))
      setSavedJobs(updated)
      alert(`${job.title} removed from saved jobs.`)
    } else {
      updated = [...currentSaved, job]
      localStorage.setItem('savedJobs', JSON.stringify(updated))
      setSavedJobs(updated)
      alert(`${job.title} saved!`)
    }
  }

  const handleApply = (job) => {
    navigate('/applicant/apply-job', { state: { job } })
  }

  return (
    <div className="page-shell premium-bg">
      <Navbar />

      <main className="dashboard-content">
        <section className="screen-header">
          <div>
            <h1>Find your next role</h1>
            <p>Explore opportunities tailored for you.</p>
          </div>

          <input
            className="job-search"
            placeholder="Search jobs, companies..."
          />
        </section>

        {/* FILTERS */}
        <div className="job-filters">
          <button className="filter-btn active">All Roles</button>
          <button className="filter-btn">Full Time</button>
          <button className="filter-btn">Part Time</button>
          <button className="filter-btn">Remote</button>
        </div>

        {/* VISIBILITY CARD */}
        <div className="visibility-card">
          <h3>🚀 Get More Visibility</h3>
          <p>Complete your profile and add skills to appear in more recruiter searches.</p>
        </div>

        <section className="job-grid">
          {applicantJobs.map((job) => (
            <JobCard
              key={job.id}
              {...job}
              onCardClick={() => handleApply(job)}
              onSave={() => handleSave(job)}
              onAction={() => handleApply(job)}
              actionText="Apply now"
              isSaved={savedIds.has(job.id)}
            />
          ))}
        </section>
      </main>
    </div>
  )
}

export default ApplicantDashboard