import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JobCard from '../../components/JobCard'
import './SavedJobs.css'

function SavedJobs() {
  const navigate = useNavigate()
  const [savedJobs, setSavedJobs] = useState(
    JSON.parse(localStorage.getItem('savedJobs') || '[]')
  )

  const handleApply = (job) => {
    navigate('/applicant/apply-job', { state: { job } })
  }

  const handleUnsave = (job) => {
    const updated = savedJobs.filter((item) => item.id !== job.id)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
    setSavedJobs(updated)
  }

  return (
    <main className="dashboard-content saved-page">
      <h1 className="dash-serif">Saved Jobs</h1>
      <p className="page-intro">Roles you bookmarked for later.</p>
      <section className="job-list-stack">
        {savedJobs.length > 0 ? (
          savedJobs.map((job) => (
            <JobCard
              key={job.id}
              variant="listing"
              {...job}
              onCardClick={() => handleApply(job)}
              onSave={() => handleUnsave(job)}
              onAction={() => handleApply(job)}
              actionText="Apply now"
              isSaved={true}
            />
          ))
        ) : (
          <p className="empty-state">No saved jobs yet. Tap Save on any job to bookmark it.</p>
        )}
      </section>
    </main>
  )
}

export default SavedJobs
