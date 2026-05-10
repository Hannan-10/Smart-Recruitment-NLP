import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import JobCard from '../../components/JobCard'
import './SavedJobs.css'

function SavedJobs() {
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()

  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs/saved', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSavedJobs(data)
    } catch {
      setSavedJobs([])
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  const handleUnsave = async (job) => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${job._id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) return
      setSavedJobs((prev) => prev.filter((j) => j._id !== job._id))
    } catch {}
  }

  const handleApply = (job) => {
    navigate('/applicant/apply-job', { state: { job } })
  }

  return (
    <main className="dashboard-content saved-page">
      <h1 className="dash-serif">Saved Jobs</h1>
      <p className="page-intro">Roles you bookmarked for later.</p>

      {loading && <p className="saved-loading">Loading saved jobs…</p>}

      <section className="job-list-stack">
        {!loading && savedJobs.length === 0 && (
          <p className="empty-state">No saved jobs yet. Tap Save on any job to bookmark it.</p>
        )}
        {savedJobs.map((job) => (
          <JobCard
            key={job._id}
            title={job.title}
            company={job.company}
            location={job.location}
            type={job.type}
            category={job.category}
            date={new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            onCardClick={() => handleApply(job)}
            onSave={() => handleUnsave(job)}
            onAction={() => handleApply(job)}
            actionText="Apply now"
            isSaved={true}
          />
        ))}
      </section>
    </main>
  )
}

export default SavedJobs
