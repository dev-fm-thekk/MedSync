"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FileText,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Heart,
  Wallet,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── MetaMask types ────────────────────────────────────────────────────────────

type MetaMaskEthereum = {
  isMetaMask?: boolean
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
}

function getEthereum(): MetaMaskEthereum | undefined {
  return typeof window !== "undefined"
    ? (window.ethereum as unknown as MetaMaskEthereum | undefined)
    : undefined
}

// ── Wallet helpers ────────────────────────────────────────────────────────────

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface WalletState {
  address: string | null
  balance: string | null
  chainId: string | null
  status: ConnectionStatus
  error: string | null
}

const INITIAL_WALLET: WalletState = {
  address: null,
  balance: null,
  chainId: null,
  status: "disconnected",
  error: null,
}

const CHAIN_NAMES: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia Testnet",
  "0x89": "Polygon",
  "0x38": "BNB Chain",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum One",
  "0x2105": "Base",
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatBalance(balance: string) {
  return parseFloat(balance).toFixed(4)
}

// ── Nav config ────────────────────────────────────────────────────────────────

export type PatientView = "docs" | "appointments" | "audit"

interface PatientSidebarProps {
  activeView: PatientView
  onViewChange: (view: PatientView) => void
}

const navItems = [
  { key: "docs" as const, label: "Your Docs", icon: FileText },
  { key: "appointments" as const, label: "Your Appointments", icon: CalendarDays },
  { key: "audit" as const, label: "Audit & Logs", icon: ShieldCheck },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function PatientSidebar({ activeView, onViewChange }: PatientSidebarProps) {
  const { user, logout } = useAuth()

  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isMetaMaskInstalled = !!getEthereum()?.isMetaMask

  // ── Wallet actions ──────────────────────────────────────────────────────────

  const fetchBalance = useCallback(async (address: string) => {
    const eth = getEthereum()
    if (!eth) return
    try {
      const hex = await eth.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      }) as string
      const balanceEth = Number(BigInt(hex)) / 1e18
      setWallet((prev) => ({ ...prev, balance: balanceEth.toString() }))
    } catch {
      // silently fail
    }
  }, [])

  const connectWallet = async () => {
    const eth = getEthereum()
    if (!eth) {
      setWallet((prev) => ({
        ...prev,
        status: "error",
        error: "MetaMask not installed. Please install the MetaMask browser extension.",
      }))
      return
    }

    setWallet((prev) => ({ ...prev, status: "connecting", error: null }))

    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[]
      const chainId = await eth.request({ method: "eth_chainId" }) as string
      const address = accounts[0]
      setWallet({ address, balance: null, chainId, status: "connected", error: null })
      fetchBalance(address)
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string }
      setWallet((prev) => ({
        ...prev,
        status: "error",
        error:
          e.code === 4001
            ? "Connection rejected. Please approve the MetaMask request."
            : (e.message ?? "Failed to connect wallet."),
      }))
    }
  }

  const disconnectWallet = () => {
    setWallet(INITIAL_WALLET)
    setPopoverOpen(false)
  }

  const copyAddress = () => {
    if (!wallet.address) return
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openEtherscan = () => {
    if (!wallet.address) return
    const base =
      wallet.chainId === "0xaa36a7"
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io"
    window.open(`${base}/address/${wallet.address}`, "_blank")
  }

  // ── MetaMask event listeners ────────────────────────────────────────────────

  useEffect(() => {
    const eth = getEthereum()
    if (!eth) return

    const onAccountsChanged = (raw: unknown) => {
      const accs = raw as string[]
      if (accs.length === 0) {
        disconnectWallet()
      } else {
        setWallet((prev) => ({ ...prev, address: accs[0] }))
        fetchBalance(accs[0])
      }
    }

    const onChainChanged = (raw: unknown) => {
      setWallet((prev) => ({ ...prev, chainId: raw as string }))
      if (wallet.address) fetchBalance(wallet.address)
    }

    eth.on("accountsChanged", onAccountsChanged)
    eth.on("chainChanged", onChainChanged)
    return () => {
      eth.removeListener("accountsChanged", onAccountsChanged)
      eth.removeListener("chainChanged", onChainChanged)
    }
  }, [wallet.address, fetchBalance])

  // ── Auto-reconnect on mount ─────────────────────────────────────────────────

  useEffect(() => {
    const eth = getEthereum()
    if (!eth) return
    eth.request({ method: "eth_accounts" })
      .then(async (raw) => {
        const accs = raw as string[]
        if (accs.length > 0) {
          const chainId = await eth.request({ method: "eth_chainId" }) as string
          setWallet({ address: accs[0], balance: null, chainId, status: "connected", error: null })
          fetchBalance(accs[0])
        }
      })
      .catch(() => {})
  }, [fetchBalance])

  // ── Wallet section UI ───────────────────────────────────────────────────────

  const chainName = wallet.chainId
    ? (CHAIN_NAMES[wallet.chainId] ?? `Chain ${wallet.chainId}`)
    : "Unknown"

  const walletSection = () => {
    if (wallet.status === "connecting") {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/50"
          disabled
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting…
        </Button>
      )
    }

    if (wallet.status === "connected") {
      return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="truncate font-mono text-xs">
                {wallet.address ? shortenAddress(wallet.address) : "Connected"}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-72 p-0 bg-sidebar border-sidebar-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                Wallet
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  wallet.chainId === "0x1"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-purple-500/15 text-purple-400"
                )}
              >
                {chainName}
              </span>
            </div>

            {/* Body */}
            <div className="space-y-3 px-4 py-3">
              <div>
                <p className="mb-1 text-xs text-sidebar-foreground/50">Address</p>
                <div className="flex items-center gap-1">
                  <code className="flex-1 truncate rounded bg-sidebar-accent px-2 py-1 font-mono text-xs text-sidebar-foreground">
                    {wallet.address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                    onClick={copyAddress}
                    title="Copy address"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                    onClick={openEtherscan}
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {copied && (
                  <p className="mt-1 text-xs text-emerald-500">Copied to clipboard!</p>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs text-sidebar-foreground/50">Balance</p>
                <p className="text-sm font-semibold text-sidebar-foreground">
                  {wallet.balance != null
                    ? `${formatBalance(wallet.balance)} ETH`
                    : "Loading…"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-sidebar-border px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                onClick={disconnectWallet}
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect Wallet
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )
    }

    // disconnected or error
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={connectWallet}
        >
          <Wallet className="h-4 w-4" />
          {isMetaMaskInstalled ? "Connect Wallet" : "MetaMask not found"}
        </Button>
        {wallet.error && (
          <p className="flex items-start gap-1.5 px-1 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            {wallet.error}
          </p>
        )}
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Heart className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">MedSync</span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            className={cn(
              "justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              activeView === item.key &&
                "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            )}
            onClick={() => onViewChange(item.key)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 px-1 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/50">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Wallet */}
        {walletSection()}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}