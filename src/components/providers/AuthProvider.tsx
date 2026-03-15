'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { API_ROUTES } from '@/config/routes'

interface AuthUser {
  id: string
  email: string
  username: string
  fullName: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; requires2fa?: boolean; error?: string }>
  register: (data: { email: string; username: string; fullName: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(API_ROUTES.auth.session)
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated) {
          setUser(data.user)
          return
        }
      }
      setUser(null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = useCallback(async (
    email: string,
    password: string,
    totpCode?: string
  ): Promise<{ success: boolean; requires2fa?: boolean; error?: string }> => {
    try {
      const res = await fetch(API_ROUTES.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totpCode }),
      })

      const data = await res.json()

      if (data.requires2fa) {
        return { success: false, requires2fa: true }
      }

      if (!res.ok) {
        return { success: false, error: data.error }
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.full_name,
        })
      }

      return { success: true }
    } catch {
      return { success: false, error: 'errorGeneric' }
    }
  }, [])

  const register = useCallback(async (
    regData: { email: string; username: string; fullName: string; password: string; confirmPassword: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(API_ROUTES.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error }
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.full_name,
        })
      }

      return { success: true }
    } catch {
      return { success: false, error: 'errorGeneric' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(API_ROUTES.auth.logout, { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
