import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import './SignIn.css'

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const role =
      localStorage.getItem('recruiter-guide-last-role') || 'applicant'

    signIn({ email: formData.email, role })

    navigate(
      role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/applicant/jobs'
    )
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Continue with your account"
      panelTitle="Welcome Back!"
      panelSubtitle="Track jobs, connect with talent, and manage hiring with a modern experience."
      panelAction={
        <Link to="/signup" className="panel-cta">
          Create Account
        </Link>
      }
      panelImage={images.SignInImg}
      panelSide="right"
      showLogoAboveForm
    >
      <form onSubmit={handleSubmit} className="auth-form">

        {/* EMAIL */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" />
            </svg>
          </span>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V8a6 6 0 10-12 0v2H5v10h14V10h-1zm-2 0H8V8a4 4 0 118 0v2z" />
            </svg>
          </span>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-auth-primary">
          Sign In
        </button>
      </form>

      {/* LINKS */}
      <div className="auth-links">
        <Link to="/forgot-password" className="link-muted">
          Forgot password?
        </Link>

        <Link to="/signup" className="link-highlight">
          Create account
        </Link>
      </div>
    </AuthLayout>
  )
}

export default SignIn