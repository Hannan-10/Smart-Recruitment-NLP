import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import './ResetPassword.css'

function EyeOpen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function ResetPassword() {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const resetToken = localStorage.getItem('reset-token')

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Password reset failed')
      localStorage.removeItem('reset-token')
      localStorage.removeItem('reset-email')
      navigate('/signin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!resetToken) {
    return (
      <div className="verify-fallback">
        <p>Reset session expired.</p>
        <Link to="/forgot-password">Request a new OTP</Link>
      </div>
    )
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Choose a strong new password"
      panelTitle="Almost Done"
      panelSubtitle="Create a new password to regain access to your account."
      panelAction={<Link to="/signin">Back to Sign In</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      {/* HERO */}
      <div className="rp-hero">
        <div className="rp-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a3 3 0 003 3h10a3 3 0 003-3v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 016 0v3H9zm3 5a2 2 0 110 4 2 2 0 010-4z" />
          </svg>
        </div>
        <h1>New Password</h1>
        <p>Min 8 characters with uppercase, lowercase & a number</p>
      </div>

      {/* FORM */}
      <form className="rp-form" onSubmit={handleSubmit}>

        {/* NEW PASSWORD */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V8a6 6 0 10-12 0v2H5v10h14V10h-1zm-2 0H8V8a4 4 0 118 0v2z" />
            </svg>
          </span>
          <input
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOpen /> : <EyeOff />}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V8a6 6 0 10-12 0v2H5v10h14V10h-1zm-2 0H8V8a4 4 0 118 0v2z" />
            </svg>
          </span>
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="button" className="eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOpen /> : <EyeOff />}
          </button>
        </div>

        {error && <p className="rp-error">{error}</p>}

        <button type="submit" className="btn-auth-primary" disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="rp-footer">
        Remember your password? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default ResetPassword
