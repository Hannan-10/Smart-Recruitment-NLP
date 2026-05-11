import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import JobCard from '../../components/JobCard'
import { useAuth } from '../../context/AuthContext'
import './AppliedJobs.css'

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
      <p className="page-intro">Where you&apos;ve applied so far.</p>
      <section className="job-list-stack">
        {loading && <p className="empty-state">Loading…</p>}
        {!loading && appliedJobs.length > 0 ? (
          appliedJobs.map((job) => (
            <JobCard
              key={job._id || job.id}
              variant="listing"
              {...job}
              status="Applied"
              onCardClick={() => handleView(job)}
              onAction={() => handleUnapply(job)}
              actionText="Applied"
              actionIcon={FiTrash2}
            />
          ))
        ) : (
          !loading && <p className="empty-state">No applications yet. Apply to a role to see it here.</p>
        )}
      </section>
    </main>
  )
}

export default AppliedJobs
