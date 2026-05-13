import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { clearProfile, setNeedOnboarding } from '../utils/signupFlow'

const AuthContext = createContext(null)

const STORAGE_KEY = 'recruiter-guide-user'
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const rawUser = localStorage.getItem(STORAGE_KEY)
    return rawUser ? JSON.parse(rawUser) : null
  })

  const signIn = useCallback((userData) => {
    clearProfile()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    localStorage.setItem(ACCESS_TOKEN_KEY, userData.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, userData.refreshToken)
    setCurrentUser(userData)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    clearProfile()
    setNeedOnboarding(false)
    setCurrentUser(null)
  }, [])

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshTokenValue) {
      signOut()
      return null
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      if (!response.ok) {
        signOut()
        return null
      }

      const data = await response.json()
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      return data.accessToken
    } catch (err) {
      console.error('Token refresh failed:', err)
      signOut()
      return null
    }
  }, [signOut])

  const getAccessToken = useCallback(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      signIn,
      signOut,
      refreshToken,
      getAccessToken,
    }),
    [currentUser, signIn, signOut, refreshToken, getAccessToken],
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
