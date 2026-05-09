import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JobCard from '../../components/JobCard'
import { applicantJobs } from '../../data/mockData'
import { getProfile } from '../../utils/signupFlow'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import './ApplicantJobs.css'

function ApplicantJobs() {
  const navigate = useNavigate()
  const profile = getProfile()
  const first = profile?.firstName || 'there'

  const [savedJobs, setSavedJobs] = useState(
    JSON.parse(localStorage.getItem('savedJobs') || '[]')
  )
  const savedIds = new Set(savedJobs.map((item) => item.id))

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Roles')

  const pills = ['All Roles', 'Full-time', 'Contract', 'Remote', 'Internship']

  const dateStr = new Date()
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()

  // ✅ FILTER LOGIC
  const filteredJobs = applicantJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All Roles' ||
      job.type?.toLowerCase() === activeFilter.toLowerCase()

    return matchesSearch && matchesFilter
  })

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
    <main className="dashboard-content applicant-jobs-page">

      {/* HEADER */}
      <header className="dash-header">
        <h1 className="dash-greeting">
          Welcome back, <span>{first}</span>
        </h1>
        <p className="dash-date">{dateStr}</p>
      </header>

      {/* SEARCH */}
      <div className="search-wrap">
        <FiSearch className="search-icon" />
        <input
          type="search"
          placeholder="Search jobs, companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTER PILLS */}
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

      {/* MAIN */}
      <div className="jobs-layout">

        {/* JOB LIST */}
        <section className="jobs-main">
          <div className="section-head">
            <h2>Jobs</h2>
            <span>{filteredJobs.length} results</span>
          </div>

          <div className="job-list">
            {filteredJobs.map((job) => (
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
          </div>
        </section>

        {/* CLEAN SIDEBAR (NOT UGLY ANYMORE) */}
        <aside className="dash-widgets">
          <div className="widget-clean">
            <div className="widget-header">
              <FiTrendingUp className="widget-icon" />
              <h3>Get More Visibility</h3>
            </div>
            <p>
              Complete your profile and add skills to appear in more recruiter searches.
            </p>
          </div>
        </aside>

      </div>
    </main>
  )
}

export default ApplicantJobs