"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useLoginWithEmail } from "@privy-io/react-auth"

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
  // 1. Replaced the old login(email, password) with Privy's two-step flow
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  connectWallet: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 2. Pull in global state and logout from Privy
  const { user: privyUser, authenticated, logout: privyLogout } = usePrivy()
  const [user, setUser] = useState<User | null>(null)

  
// 3. Updated Privy email login integration
const { sendCode, loginWithCode } = useLoginWithEmail({
  // Destructure 'user' from the params object Privy provides
  onComplete: ({ user: privyUserResponse, isNewUser }) => {
    console.log("OTP Verified! User is:", privyUserResponse.id);
    if (isNewUser) {
      console.log("Welcome! This is a new MedSync account.");
    }
  },
  onError: (error) => {
    console.error("Login failed:", error);
  }
})

  // 4. Automatically sync Privy's authentication state with your MedSync user state
  useEffect(() => {
    if (authenticated && privyUser) {
      // Map Privy's data to your custom User interface
      setUser({
        id: privyUser.id,
        name: "MedSync User", // Note: You'll eventually fetch the real name from your backend using this ID
        email: privyUser.email?.address || "",
        role: "patient", // Defaulting to patient for now
        // This maps perfectly for your decentralized identity features later!
        walletAddress: privyUser.wallet?.address 
      })
    } else {
      setUser(null)
    }
  }, [authenticated, privyUser])

  // 5. Wrap the Privy hooks so the rest of your app can use them
  const sendOtp = async (email: string) => {
    await sendCode({ email })
  }

  const verifyOtp = async (code: string) => {
    await loginWithCode({ code })
  }

  // Keeping your mock wallet connect for now (Privy also has a useWallets hook we can use later)
  const connectWallet = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1200))
    setUser((prev) => prev ? { ...prev, walletAddress: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0b" } : null)
  }, [])

  const logout = useCallback(() => {
    privyLogout() // Tell Privy to end the session
    setUser(null) // Clear local state
  }, [privyLogout])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: authenticated,
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