import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import JobCard from '../../components/JobCard'
import { recruiterJobs } from '../../data/mockData'
import { getProfile } from '../../utils/signupFlow'
import { FiSearch, FiTrendingUp, FiX, FiBriefcase, FiMapPin, FiFileText, FiSave, FiTrash2 } from 'react-icons/fi'
import './RecruiterDashboard.css'

function RecruiterDashboard() {
  const navigate = useNavigate()
  const profile = getProfile()
  const first = profile?.firstName || 'there'

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Jobs')
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    const postedJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]')
    setJobs([...recruiterJobs, ...postedJobs])
  }, [])

  const jobTypes = ['Full-time', 'Contract', 'Remote', 'Internship']

  const handleEditClick = (job) => {
    setSelectedJob(job)
    setEditForm({ ...job })
  }

  const handleClose = () => {
    setSelectedJob(null)
    setEditForm(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const updatedJobs = jobs.map((job) =>
      job.id === editForm.id ? editForm : job
    )
    setJobs(updatedJobs)

    const postedJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]')
    const updatedPosted = postedJobs.map((job) =>
      job.id === editForm.id ? editForm : job
    )
    localStorage.setItem('postedJobs', JSON.stringify(updatedPosted))

    setSelectedJob(null)
    setEditForm(null)
    alert('Job updated successfully!')
  }

  const handleDeleteJob = (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      const updatedJobs = jobs.filter((job) => job.id !== id)
      setJobs(updatedJobs)

      const postedJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]')
      const updatedPosted = postedJobs.filter((job) => job.id !== id)
      localStorage.setItem('postedJobs', JSON.stringify(updatedPosted))
      
      setSelectedJob(null)
      setEditForm(null)
    }
  }

  const pills = ['All Jobs', 'Full-time', 'Contract', 'Remote', 'Internship']

  const dateStr = new Date()
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()

  // FILTER LOGIC
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      activeFilter === 'All Jobs' ||
      job.type?.toLowerCase() === activeFilter.toLowerCase()

    return matchesSearch && matchesFilter
  })

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
            placeholder="Search jobs, titles..."
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
              <h2>Posted Jobs</h2>
              <span>{filteredJobs.length} results</span>
            </div>

            <div className="job-list">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  onCardClick={() => handleEditClick(job)}
                  onAction={() => handleEditClick(job)}
                  actionText="Edit Job"
                />
              ))}
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="dash-widgets">
            <div className="widget-clean">
              <div className="widget-header">
                <FiTrendingUp className="widget-icon" />
                <h3>Post a New Job</h3>
              </div>
              <p>
                Create a new job posting to attract more qualified candidates.
              </p>
              <button 
                onClick={() => navigate('/recruiter/post-job')}
                className="widget-btn"
              >
                Post Job
              </button>
            </div>
          </aside>

        </div>

        {/* EDIT MODAL */}
        {selectedJob && editForm && (
          <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <h2>Edit Position</h2>
                  <p>Update job details for {selectedJob.title}</p>
                </div>
                <button className="btn-close" onClick={handleClose}>
                  <FiX />
                </button>
              </div>

              <form className="edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="form-section-modal">
                  <div className="form-row-modal">
                    <div className="form-group-modal">
                      <label className="form-label-modal">
                        <FiBriefcase /> Job Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Senior Product Designer"
                      />
                    </div>
                    <div className="form-group-modal">
                      <label className="form-label-modal">Job Type</label>
                      <select
                        name="type"
                        value={editForm.type}
                        onChange={handleChange}
                        className="job-type-select-modal"
                      >
                        {jobTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-modal">
                    <div className="form-group-modal">
                      <label className="form-label-modal">
                        <FiBriefcase /> Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={editForm.company}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group-modal">
                      <label className="form-label-modal">
                        <FiMapPin /> Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-modal full-width">
                    <label className="form-label-modal">
                      <FiFileText /> Job Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleChange}
                      rows={8}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer-recruiter">
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(selectedJob.id)}
                    className="btn-delete-outline-recruiter"
                  >
                    <FiTrash2 /> Delete Posting
                  </button>
                  <div className="modal-footer-right-recruiter">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-cancel-recruiter"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-save-recruiter">
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    )
  }

export default RecruiterDashboard
