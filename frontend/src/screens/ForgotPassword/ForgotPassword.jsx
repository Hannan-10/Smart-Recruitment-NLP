import { Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import './ForgotPassword.css'

function ForgotPassword() {
  return (
    <AuthLayout
      //title="Forgot Password"
      //subtitle="We’ll help you recover your account"
      panelTitle="Reset Access Securely"
      panelSubtitle="Enter your email and we’ll send you a recovery link."
      panelAction={<Link to="/signin">Back to Sign In</Link>}
      panelImage={images.SignInImg}
      panelSide="right"
    >
      {/* ===== HERO SECTION ===== */}
      <div className="fp-hero">

        {/* MAIN ICON (SOFT RECOVERY STYLE) */}
        <div className="fp-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a3 3 0 003 3h10a3 3 0 003-3v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 016 0v3H9zm3 5a2 2 0 110 4 2 2 0 010-4z" />
          </svg>
        </div>

        {/* TEXT BLOCK */}
        <h1>Forgot Password?</h1>
        <p>No worries — we’ll send a reset link to your email</p>
      </div>

      {/* FORM */}
      <form className="fp-form">

        <div className="input-group">
          <span className="input-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" />
            </svg>
          </span>

          <input
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>

        <button type="submit" className="btn-auth-primary">
          Send Reset Link
        </button>
      </form>

      <p className="fp-footer">
        Remember your password? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword