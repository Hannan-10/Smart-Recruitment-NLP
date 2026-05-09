import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { FiBriefcase, FiMapPin, FiFileText, FiCheck } from 'react-icons/fi'
import './PostJob.css'

function PostJob() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
  })

  const jobTypes = ['Full-time', 'Contract', 'Remote', 'Internship']

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Save to localStorage
    const existingJobs = JSON.parse(localStorage.getItem('postedJobs') || '[]')
    const newJob = {
      id: Date.now(),
      ...form,
    }
    existingJobs.push(newJob)
    localStorage.setItem('postedJobs', JSON.stringify(existingJobs))
    
    // Show success message
    setShowSuccess(true)
    setForm({ title: '', company: '', location: '', type: 'Full-time', description: '' })
    
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/recruiter/dashboard')
    }, 2000)
  }

  return (
    <main className="dashboard-content post-job-page">
        {/* SUCCESS MESSAGE */}
        {showSuccess && (
          <div className="success-banner">
            <div className="success-content">
              <FiCheck className="success-icon" />
              <div>
                <h3>Job Posted Successfully!</h3>
                <p>Your job posting is now live. Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="post-header">
          <h1 className="dash-serif">Post a New Job</h1>
          <p>Create an attractive job listing to attract qualified candidates.</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="job-form-modern">
          <div className="form-section">
            <h2>Job Details</h2>
            
            {/* ROW 1 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FiBriefcase /> Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="job-type-select"
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FiBriefcase /> Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g., Tech Company Inc."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FiMapPin /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, NY"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group full-width">
              <label className="form-label">
                <FiFileText /> Job Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the job responsibilities, requirements, and what makes your company great..."
                rows={8}
                required
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Publish Job
            </button>
          </div>
        </form>
      </main>
    )
  }

export default PostJob
