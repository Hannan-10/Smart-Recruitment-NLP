import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import { setPendingSignup } from '../../utils/signupFlow'
import './SignUp.css'

function SignUp() {
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'applicant',
  })

  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    setError('')

    setPendingSignup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
    })

    navigate('/verify-otp')
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join as recruiter or applicant"
      panelTitle="Build Your Career Path"
      panelSubtitle="Create your space, explore opportunities, and manage recruitment faster."
      panelAction={<Link to="/signin">Sign In</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      <form onSubmit={handleSubmit}>

        {/* ROLE SELECTOR (UNCHANGED) */}
        <div className="role-selector">
          <div
            className={`role-card ${formData.role === 'applicant' ? 'active' : ''}`}
            onClick={() =>
              setFormData((prev) => ({ ...prev, role: 'applicant' }))
            }
          >
            <div className="role-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
              </svg>
            </div>
            <h3>Applicant</h3>
            <p>Find jobs & apply easily</p>
          </div>

          <div
            className={`role-card ${formData.role === 'recruiter' ? 'active' : ''}`}
            onClick={() =>
              setFormData((prev) => ({ ...prev, role: 'recruiter' }))
            }
          >
            <div className="role-icon">
              <svg viewBox="0 0 24 24">
                <path d="M6 7V6a3 3 0 013-3h6a3 3 0 013 3v1h2a1 1 0 011 1v3H3V8a1 1 0 011-1h2zm2 0h8V6a1 1 0 00-1-1H9a1 1 0 00-1 1v1zm13 6v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6h18z" />
              </svg>
            </div>
            <h3>Recruiter</h3>
            <p>Post jobs & hire talent</p>
          </div>
        </div>

        {/* ===== INPUTS WITH ICONS ===== */}

        {/* FIRST NAME */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
            </svg>
          </span>
          <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
        </div>

        {/* LAST NAME */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
            </svg>
          </span>
          <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
        </div>

        {/* EMAIL */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" />
            </svg>
          </span>
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        </div>

        {/* PASSWORD */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V8a6 6 0 10-12 0v2H5v10h14V10h-1zm-2 0H8V8a4 4 0 118 0v2z" />
            </svg>
          </span>
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V8a6 6 0 10-12 0v2H5v10h14V10h-1zm-2 0H8V8a4 4 0 118 0v2z" />
            </svg>
          </span>
          <input name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn-auth-primary">
          Create Account
        </button>
      </form>

      <p className="signin-link">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default SignUp