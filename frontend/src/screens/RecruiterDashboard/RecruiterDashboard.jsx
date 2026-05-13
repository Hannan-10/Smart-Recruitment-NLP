import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import JobCard from '../../components/JobCard'
import { getProfile } from '../../utils/signupFlow'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import Loader from '../../components/Loader'
import './RecruiterDashboard.css'

const pills = ['All Jobs', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']

function RecruiterDashboard() {
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()
  const profile = getProfile()
  const first = profile?.firstName || 'there'

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Jobs')

  const dateStr = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()

  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs/my', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      })
      if (!res.ok) throw new Error('Failed to load jobs')
      const data = await res.json()
      setJobs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => { fetchMyJobs() }, [fetchMyJobs])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All Jobs' ||
      job.type?.replace(/-/g, ' ').toLowerCase() === activeFilter.toLowerCase()

    return matchesSearch && matchesFilter
  })

  return (
    <main className="dashboard-content applicant-jobs-page">

      <header className="dash-header">
        <h1 className="dash-greeting">Welcome back, <span>{first}</span></h1>
        <p className="dash-date">{dateStr}</p>
      </header>

      <div className="search-wrap">
        <FiSearch className="search-icon" />
        <input
          type="search"
          placeholder="Search jobs by title or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-pills">
        {pills.map((label) => (
          <button
            key={label}
            onClick={() => setActiveFilter(label)}
            className={`pill ${activeFilter === label ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="jobs-layout">
        <section className="jobs-main">
          <div className="section-head">
            <h2>Posted Jobs</h2>
            <span>{filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}</span>
          </div>

          {loading && <Loader text="Loading jobs…" size="sm" />}
          {error && <p style={{ color: '#dc2626', paddingTop: 16 }}>{error}</p>}

          <div className="job-list">
            {!loading && !error && filteredJobs.length === 0 && (
              <p style={{ color: '#94a3b8', paddingTop: 8 }}>No jobs posted yet.</p>
            )}
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                title={job.title}
                company={job.company}
                location={job.location}
                type={job.type}
                category={job.category}
                date={new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                logo={profile?.photoPreview}
                onCardClick={() => navigate(`/recruiter/jobs/${job._id}`)}
                actionText="View Details"
                onAction={() => navigate(`/recruiter/jobs/${job._id}`)}
              />
            ))}
          </div>
        </section>

        <aside className="dash-widgets">
          <div className="widget-clean">
            <div className="widget-header">
              <FiTrendingUp className="widget-icon" />
              <h3>Post a New Job</h3>
            </div>
            <p>Create a new job posting to attract more qualified candidates.</p>
            <button onClick={() => navigate('/recruiter/post-job')} className="widget-btn">
              Post Job
            </button>
          </div>
        </aside>
      </div>

    </main>
  )
}

export default RecruiterDashboard
