import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ApplicantShell from './components/ApplicantShell'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import VerifyOTP from './screens/VerifyOTP'
import ForgotPassword from './screens/ForgotPassword'
import Onboarding from './screens/Onboarding'
import RecruiterDashboard from './screens/RecruiterDashboard'
import PostJob from './screens/PostJob'
//import EditJob from './screens/EditJob'
import Applicants from './screens/Applicants'
import ApplicantProfile from './screens/ApplicantProfile'
import ApplicantJobs from './screens/ApplicantJobs'
import SavedJobs from './screens/SavedJobs'
import AppliedJobs from './screens/AppliedJobs'
import ApplyJob from './screens/ApplyJob'
import ApplicantSettings from './screens/ApplicantSettings'
import DeleteAccount from './screens/DeleteAccount'
import RecruiterProfile from './screens/RecruiterProfile'
import RecruiterSettings from './screens/RecruiterSettings'
import RecruiterShell from './components/RecruiterShell'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/delete-account"
          element={
            <ProtectedRoute role="applicant">
              <DeleteAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant"
          element={
            <ProtectedRoute role="applicant">
              <ApplicantShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="jobs" replace />} />
          <Route path="profile" element={<ApplicantProfile />} />
          <Route path="jobs" element={<ApplicantJobs />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="applied-jobs" element={<AppliedJobs />} />
          <Route path="apply-job" element={<ApplyJob />} />
          <Route path="settings" element={<ApplicantSettings />} />
        </Route>

        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="profile" element={<RecruiterProfile />} />
          <Route path="settings" element={<RecruiterSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
