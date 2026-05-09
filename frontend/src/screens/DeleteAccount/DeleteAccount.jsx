import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { images } from '../../assets'
import { useAuth } from '../../context/AuthContext'
import './DeleteAccount.css'

function DeleteAccount() {
  const [confirmText, setConfirmText] = useState('')
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const valid = confirmText.trim().toUpperCase() === 'DELETE'

  const handleDelete = (e) => {
    e.preventDefault()
    if (!valid) return
    localStorage.clear()
    signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <AuthLayout
      title="Delete account"
      subtitle="This removes local profile data in this demo."
      panelTitle="We’re sorry to see you go"
      panelSubtitle="You can always create a new account later."
      panelAction={<Link to="/applicant/settings">Keep my account</Link>}
      panelImage={images.SignInImg}
      panelSide="left"
    >
      <form onSubmit={handleDelete}>
        <p className="delete-warning">
          Type <strong>DELETE</strong> to confirm. This clears saved profile and preferences in the browser.
        </p>
        <input
          placeholder="Type DELETE"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="btn-auth-danger" disabled={!valid}>
          Delete account permanently
        </button>
      </form>
    </AuthLayout>
  )
}

export default DeleteAccount
