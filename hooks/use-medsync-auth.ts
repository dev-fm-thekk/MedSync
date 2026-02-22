"use client"

import { useAuth } from "@/lib/auth-context"

/**
 * Deprecated: This hook is kept for backward compatibility.
 * Use useAuth() directly instead.
 */
export function useMedSyncAuth() {
  const { user, isAuthenticated, logout, connectWallet, walletAddress, chainId } = useAuth()

  return {
    user,
    isAuthenticated,
    logout,
    connectWallet,
    walletAddress,
    chainId,
    // Deprecated methods - kept for backward compatibility
    sendOtp: async () => {
      throw new Error("Email/OTP is deprecated. Use MetaMask wallet connection instead.")
    },
    verifyOtp: async () => {
      throw new Error("Email/OTP is deprecated. Use MetaMask wallet connection instead.")
    },
  }
}
