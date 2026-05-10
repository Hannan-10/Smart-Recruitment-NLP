import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      localStorage.setItem('reset-email', email)
      navigate('/forgot-password/verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      panelTitle="Reset Access Securely"
      panelSubtitle="Enter your email and we'll send a 6-digit OTP to verify it's you."
      panelAction={<Link to="/signin">Back to Sign In</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      {/* HERO */}
      <div className="fp-hero">
        <div className="fp-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a3 3 0 003 3h10a3 3 0 003-3v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 016 0v3H9zm3 5a2 2 0 110 4 2 2 0 010-4z" />
          </svg>
        </div>
        <h1>Forgot Password?</h1>
        <p>We'll send a 6-digit OTP to your email</p>
      </div>

      {/* FORM */}
      <form className="fp-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" />
            </svg>
          </span>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="fp-error">{error}</p>}

        <button type="submit" className="btn-auth-primary" disabled={loading}>
          {loading ? 'Sending OTP…' : 'Send OTP'}
        </button>
      </form>

      <p className="fp-footer">
        Remember your password? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
