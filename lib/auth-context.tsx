"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { BrowserProvider } from "ethers"

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
  connectWallet: () => Promise<any>
  logout: () => void
  walletAddress: string | null
  chainId: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Store wallet address in localStorage for persistence
const WALLET_STORAGE_KEY = "medsync_wallet_address"
const ROLE_STORAGE_KEY = "medsync_user_role"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  // Initialize wallet from localStorage on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY)
        const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null

        if (savedWallet && typeof window !== "undefined" && window.ethereum) {
          try {
            const provider = new BrowserProvider(window.ethereum)
            const network = await provider.getNetwork()
            const accounts = await window.ethereum.request({
              method: "eth_accounts",
            }) as string[]

            if (accounts.length > 0 && accounts[0].toLowerCase() === savedWallet.toLowerCase()) {
              setWalletAddress(accounts[0])
              setChainId(Number(network.chainId))

              setUser({
                id: accounts[0],
                name: `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
                email: "",
                role: savedRole || "patient",
                walletAddress: accounts[0],
              })
            } else {
              localStorage.removeItem(WALLET_STORAGE_KEY)
              localStorage.removeItem(ROLE_STORAGE_KEY)
            }
          } catch (error) {
            console.error("[v0] Error initializing wallet:", error)
            localStorage.removeItem(WALLET_STORAGE_KEY)
            localStorage.removeItem(ROLE_STORAGE_KEY)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeWallet()
  }, [])

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[v0] Accounts changed:", accounts)
      if (accounts.length === 0) {
        logout()
      } else if (accounts[0]) {
        const newAddress = accounts[0]
        const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY)

        if (savedWallet?.toLowerCase() !== newAddress.toLowerCase()) {
          logout()
        }
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      console.log("[v0] Chain changed:", chainIdHex)
      const newChainId = parseInt(chainIdHex, 16)
      setChainId(newChainId)
    }

    const handleDisconnect = () => {
      console.log("[v0] MetaMask disconnected")
      logout()
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)
    window.ethereum.on("disconnect", handleDisconnect)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener("chainChanged", handleChainChanged)
      window.ethereum?.removeListener("disconnect", handleDisconnect)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed")
      }

      setIsLoading(true)
      const provider = new BrowserProvider(window.ethereum)

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0]
      const network = await provider.getNetwork()

      setWalletAddress(address)
      setChainId(Number(network.chainId))

      // Save to localStorage
      localStorage.setItem(WALLET_STORAGE_KEY, address)

      setUser({
        id: address,
        name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        email: "",
        role: localStorage.getItem(ROLE_STORAGE_KEY) as UserRole || "patient",
        walletAddress: address,
      })

      console.log("[v0] Wallet connected:", address)
    } catch (error) {
      console.error("[v0] Error connecting wallet:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setWalletAddress(null)
    setChainId(null)
    localStorage.removeItem(WALLET_STORAGE_KEY)
    localStorage.removeItem(ROLE_STORAGE_KEY)
    console.log("[v0] User logged out")
  }, [])

  const isAuthenticated = !!user && !!walletAddress

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        connectWallet,
        logout,
        walletAddress,
        chainId,
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
