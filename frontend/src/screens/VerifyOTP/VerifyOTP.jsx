import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import {
  clearPendingSignup,
  getPendingSignup,
  setNeedOnboarding,
  setSignupMeta,
} from '../../utils/signupFlow'
import './VerifyOTP.css'

const DEMO_OTP = '123456'

function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const pending = getPendingSignup()

  /* TIMER */
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleResend = () => {
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

    if (value && index < 5) {
      inputsRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const code = otp.join('')

    if (code.length !== 6) {
      setError('Enter the 6-digit code.')
      return
    }

    if (code !== DEMO_OTP) {
      setError('Invalid code. Try 123456 for demo.')
      return
    }

    setError('')

    localStorage.setItem('recruiter-guide-last-role', pending.role)

    setSignupMeta({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
    })

    signIn({ email: pending.email, role: pending.role })
    clearPendingSignup()

    setNeedOnboarding(true)
    navigate('/onboarding', { replace: true })
  }

  if (!pending) {
    return (
      <div className="verify-fallback">
        <p>No signup data found.</p>
        <Link to="/signup">Back to sign up</Link>
      </div>
    )
  }

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`We sent a code to ${pending.email}`}
      panelTitle="Almost there"
      panelSubtitle="Enter the 6-digit verification code sent to your email."
      panelAction={<Link to="/signup">Change email</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      {/* HEADER */}
      <div className="otp-header">
        <div className="otp-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z" />
          </svg>
        </div>
        <h2>Verification Code</h2>
        <p>Enter the code to continue</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* OTP ROW FIX */}
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

        {/* TIMER */}
        <div className="otp-timer">
          {timeLeft > 0 ? (
            <p>
              Resend code in <span>{timeLeft}s</span>
            </p>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend Code
            </button>
          )}
        </div>

        <button type="submit" className="btn-auth-primary">
          Verify & Continue
        </button>
      </form>

      <p className="auth-footer-link">
        Didn’t receive code? <span>Check spam folder</span>
      </p>
    </AuthLayout>
  )
}

export default VerifyOTP