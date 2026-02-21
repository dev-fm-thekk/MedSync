"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type UserRole = "patient" | "doctor"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  walletAddress?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  connectWallet: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS: Record<string, User> = {
  "patient@health.io": {
    id: "p1",
    name: "Alice Johnson",
    email: "patient@health.io",
    role: "patient",
  },
  "doctor@health.io": {
    id: "d1",
    name: "Dr. Michael Chen",
    email: "doctor@health.io",
    role: "doctor",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800))
    const found = MOCK_USERS[email.toLowerCase()]
    if (!found) throw new Error("Invalid credentials")
    setUser(found)
  }, [])

  const connectWallet = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1200))
    setUser({
      id: "p2",
      name: "Wallet User",
      email: "0x1a2b...9z",
      role: "patient",
      walletAddress: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0b",
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        connectWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
