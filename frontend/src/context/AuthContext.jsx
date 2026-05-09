import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'recruiter-guide-user'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const rawUser = localStorage.getItem(STORAGE_KEY)
    return rawUser ? JSON.parse(rawUser) : null
  })

  const signIn = ({ email, role }) => {
    const normalizedRole = role.toLowerCase()
    const user = { email, role: normalizedRole }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setCurrentUser(user)
  }

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({
      currentUser,
      signIn,
      signOut,
    }),
    [currentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
