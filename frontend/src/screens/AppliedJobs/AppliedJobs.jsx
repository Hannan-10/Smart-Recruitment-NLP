import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import JobCard from '../../components/JobCard'
import './AppliedJobs.css'

function AppliedJobs() {
  const navigate = useNavigate()
  const [appliedJobs, setAppliedJobs] = useState([])

  useEffect(() => {
    setAppliedJobs(JSON.parse(localStorage.getItem('appliedJobs') || '[]'))
  }, [])

  const handleUnapply = (job) => {
    const remaining = appliedJobs.filter((item) => item.id !== job.id)
    localStorage.setItem('appliedJobs', JSON.stringify(remaining))
    setAppliedJobs(remaining)
  }

  const handleView = (job) => {
    navigate('/applicant/apply-job', { state: { job } })
  }

  return (
    <main className="dashboard-content applied-page">
      <h1 className="dash-serif">Applications</h1>
      <p className="page-intro">Where you’ve applied so far.</p>
      <section className="job-list-stack">
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job) => (
            <JobCard
              key={job.id}
              variant="listing"
              {...job}
              status="Applied"
              onCardClick={() => handleView(job)}
              onAction={() => handleUnapply(job)}
              actionText="Unapply"
              actionIcon={FiTrash2}
            />
          ))
        ) : (
          <p className="empty-state">No applications yet. Apply to a role to see it here.</p>
        )}
      </section>
    </main>
  )
}

export default AppliedJobs
