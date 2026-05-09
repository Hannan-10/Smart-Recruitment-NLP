const PENDING = 'recruiter-guide-pending-signup'
const NEED_ONBOARD = 'recruiter-guide-need-onboarding'
const PROFILE = 'recruiter-guide-profile'

export function setPendingSignup(data) {
  localStorage.setItem(PENDING, JSON.stringify(data))
}

export function getPendingSignup() {
  const raw = localStorage.getItem(PENDING)
  return raw ? JSON.parse(raw) : null
}

export function clearPendingSignup() {
  localStorage.removeItem(PENDING)
}

export function setNeedOnboarding(value) {
  if (value) localStorage.setItem(NEED_ONBOARD, '1')
  else localStorage.removeItem(NEED_ONBOARD)
}

export function needsOnboarding() {
  return localStorage.getItem(NEED_ONBOARD) === '1'
}

export function getProfile() {
  const raw = localStorage.getItem(PROFILE)
  return raw ? JSON.parse(raw) : null
}

export function setProfile(data) {
  localStorage.setItem(PROFILE, JSON.stringify(data))
}

const META = 'recruiter-guide-signup-meta'

export function setSignupMeta(data) {
  localStorage.setItem(META, JSON.stringify(data))
}

export function getSignupMeta() {
  const raw = localStorage.getItem(META)
  return raw ? JSON.parse(raw) : null
}

export function clearSignupMeta() {
  localStorage.removeItem(META)
}
