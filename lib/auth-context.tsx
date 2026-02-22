"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { usePrivy, useWallets, useLoginWithEmail } from "@privy-io/react-auth"

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
  isLoading: boolean
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  connectWallet: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, authenticated, logout: privyLogout, ready } = usePrivy()
  const { wallets } = useWallets()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(!ready)

  const { sendCode, loginWithCode } = useLoginWithEmail({
    onComplete: ({ user: privyUserResponse, isNewUser }) => {
      console.log("[v0] OTP Verified! User is:", privyUserResponse.id)
      if (isNewUser) {
        console.log("[v0] Welcome! This is a new MedSync account.")
      }
    },
    onError: (error) => {
      console.error("[v0] Login failed:", error)
    },
  })

  // Sync Privy's authentication state with MedSync user state
  useEffect(() => {
    setIsLoading(!ready)
    
    if (authenticated && privyUser) {
      // Get wallet address from the wallets array (Privy's useWallets hook)
      const walletAddress = wallets.length > 0 ? wallets[0].address : privyUser.wallet?.address
      
      setUser({
        id: privyUser.id,
        name: privyUser.customMetadata?.name || "MedSync User",
        email: privyUser.email?.address || "",
        role: (privyUser.customMetadata?.role as UserRole) || "patient",
        walletAddress,
      })
    } else {
      setUser(null)
    }
  }, [authenticated, privyUser, wallets, ready])

  const sendOtp = async (email: string) => {
    try {
      await sendCode({ email })
    } catch (error) {
      console.error("[v0] Error sending OTP:", error)
      throw error
    }
  }

  const verifyOtp = async (code: string) => {
    try {
      await loginWithCode({ code })
    } catch (error) {
      console.error("[v0] Error verifying OTP:", error)
      throw error
    }
  }

  // Privy handles wallet connection through the UI, this is a fallback
  const connectWallet = useCallback(async () => {
    try {
      // Privy automatically manages wallet connections through useWallets hook
      // This is here as a fallback if needed
      if (wallets.length === 0) {
        console.log("[v0] No wallets available yet. User may need to connect via Privy UI.")
      }
    } catch (error) {
      console.error("[v0] Error connecting wallet:", error)
      throw error
    }
  }, [wallets])

  const logout = useCallback(() => {
    privyLogout()
    setUser(null)
  }, [privyLogout])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: authenticated,
        isLoading,
        sendOtp,
        verifyOtp,
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
