import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import './ForgotPasswordVerifyOTP.css'

function ForgotPasswordVerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const email = localStorage.getItem('reset-email')

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleResend = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {}
    setTimeLeft(60)
    setOtp(['', '', '', '', '', ''])
    setError('')
    inputsRef.current[0]?.focus()
  }

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputsRef.current[index + 1].focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Enter the 6-digit code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'OTP verification failed')
      localStorage.setItem('reset-token', data.resetToken)
      navigate('/reset-password')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="verify-fallback">
        <p>No email found. Please start over.</p>
        <Link to="/forgot-password">Go back</Link>
      </div>
    )
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email}`}
      panelTitle="Almost there"
      panelSubtitle="Enter the OTP sent to your email to proceed with resetting your password."
      panelAction={<Link to="/forgot-password">Change email</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      <div className="otp-header">
        <div className="otp-icon">
          <svg viewBox="0 0 24 24">
            <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" />
          </svg>
        </div>
        <h2>Enter OTP</h2>
        <p>Code sent to {email}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="otp-group">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-box"
            />
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="otp-timer">
          {timeLeft > 0 ? (
            <p>Resend code in <span>{timeLeft}s</span></p>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend Code
            </button>
          )}
        </div>

        <button type="submit" className="btn-auth-primary" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>

      <p className="auth-footer-link">
        Didn't receive code? <span>Check your spam folder</span>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordVerifyOTP
