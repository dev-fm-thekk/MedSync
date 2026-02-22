"use client"

import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth"

export function useMedSyncAuth() {
  const { user, authenticated, logout, connectWallet } = usePrivy()

  // This hook handles the actual email/OTP logic
  const { sendCode, loginWithCode } = useLoginWithEmail({
    onComplete: ({ user, isNewUser }) => {
      console.log(`User ${user.id} authenticated!`);
      // Here is where you'd typically tell your MedSync backend 
      // to check if this user is a "doctor" or "patient"
    },
    onError: (error) => console.error("Login error:", error)
  })

  // Simplify the interface for your UI components
  return {
    user,
    isAuthenticated: authenticated,
    sendOtp: (email: string) => sendCode({ email }),
    verifyOtp: (code: string) => loginWithCode({ code }),
    logout,
    connectWallet,
    // Custom mapping for MedSync
    walletAddress: user?.wallet?.address,
    email: user?.email?.address
  }
}