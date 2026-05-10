import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import JobCard from '../../components/JobCard'
import { getProfile } from '../../utils/signupFlow'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import './ApplicantJobs.css'

const TYPE_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  remote: 'Remote',
  internship: 'Internship',
}

const TYPE_PILLS = ['All Roles', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']

function ApplicantJobs() {
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()
  const profile = getProfile()
  const first = profile?.firstName || 'there'

  const [jobs, setJobs] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All Roles')
  const [activeCategory, setActiveCategory] = useState('All')

  const dateStr = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setJobs(data)
    } catch {
      setJobs([])
    }
  }, [])

  const fetchSaved = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return
    try {
      const res = await fetch('http://localhost:5000/api/jobs/saved', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setSavedIds(new Set(data.map((j) => j._id)))
    } catch {}
  }, [getAccessToken])

  useEffect(() => {
    Promise.all([fetchJobs(), fetchSaved()]).finally(() => setLoading(false))
  }, [fetchJobs, fetchSaved])

  const handleSave = async (job) => {
    const token = getAccessToken()
    if (!token) return
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${job._id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (data.saved) next.add(job._id)
        else next.delete(job._id)
        return next
      })
    } catch {}
  }

  const handleApply = (job) => {
    navigate('/applicant/apply-job', { state: { job } })
  }

  // Unique categories from fetched jobs (excluding empty)
  const categories = ['All', ...new Set(jobs.map((j) => j.category).filter(Boolean))]

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase()
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      job.category?.toLowerCase().includes(q)

    const matchesType =
      activeType === 'All Roles' ||
      TYPE_LABELS[job.type]?.toLowerCase() === activeType.toLowerCase()

    const matchesCategory =
      activeCategory === 'All' || job.category === activeCategory

    return matchesSearch && matchesType && matchesCategory
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
          placeholder="Search by title, company, or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TYPE FILTER */}
      <div className="filter-pills">
        {TYPE_PILLS.map((label) => (
          <button
            key={label}
            onClick={() => setActiveType(label)}
            className={`pill ${activeType === label ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CATEGORY FILTER */}
      {categories.length > 1 && (
        <div className="filter-pills category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pill pill--category ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="jobs-layout">
        <section className="jobs-main">
          <div className="section-head">
            <h2>Open Roles</h2>
            <span>{filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}</span>
          </div>

          {loading && <p style={{ color: '#64748b', paddingTop: 16 }}>Loading jobs…</p>}

          <div className="job-list">
            {!loading && filteredJobs.length === 0 && (
              <p style={{ color: '#94a3b8', paddingTop: 8 }}>No jobs match your filters.</p>
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
                onCardClick={() => handleApply(job)}
                onSave={() => handleSave(job)}
                onAction={() => handleApply(job)}
                actionText="Apply now"
                isSaved={savedIds.has(job._id)}
              />
            ))}
          </div>
        </section>

        <aside className="dash-widgets">
          <div className="widget-clean">
            <div className="widget-header">
              <FiTrendingUp className="widget-icon" />
              <h3>Get More Visibility</h3>
            </div>
            <p>Complete your profile and add skills to appear in more recruiter searches.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default ApplicantJobs
