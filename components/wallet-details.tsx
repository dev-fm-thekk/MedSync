"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Copy, ExternalLink, Loader2 } from "lucide-react"

interface WalletBalance {
  wei: string
  formatted: string
}

const NETWORK_NAMES: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia Testnet",
  "0x5": "Goerli Testnet",
  "0x89": "Polygon",
  "0xa86a": "Avalanche",
  "0xa4b1": "Arbitrum One",
  "0xa": "Optimism",
  "0x38": "BSC",
  "0x2105": "Base",
}

export function WalletDetails() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const address = user?.walletAddress ?? null

  useEffect(() => {
    if (!address || typeof window === "undefined" || !window.ethereum) return

    const fetchOnChainData = async () => {
      setIsLoading(true)
      try {
        // Fetch chain ID and balance in parallel
        const [chain, rawBalance] = await Promise.all([
          window.ethereum!.request({ method: "eth_chainId" }) as Promise<string>,
          window.ethereum!.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          }) as Promise<string>,
        ])

        setChainId(chain)

        // Convert hex wei → ETH (18 decimals)
        const weiBigInt = BigInt(rawBalance)
        const eth = Number(weiBigInt) / 1e18
        setBalance({
          wei: weiBigInt.toString(),
          formatted: `${eth.toFixed(6)} ETH`,
        })
      } catch (err) {
        console.error("[WalletDetails] Failed to fetch on-chain data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOnChainData()

    // Re-fetch if user switches network
    const handleChainChange = (newChain: unknown) => {
      setChainId(newChain as string)
      fetchOnChainData()
    }

    window.ethereum.on?.("chainChanged", handleChainChange)
    return () => window.ethereum!.removeListener?.("chainChanged", handleChainChange)
  }, [address])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const networkName = chainId
    ? (NETWORK_NAMES[chainId.toLowerCase()] ?? `Chain ${parseInt(chainId, 16)}`)
    : "Unknown Network"

  // ── Not connected ──────────────────────────────────────────────
  if (!address) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>No wallet connected</span>
      </div>
    )
  }

  // ── Connected ──────────────────────────────────────────────────
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 w-full justify-start"
          title="View wallet details"
        >
          <Wallet className="h-4 w-4" />
          <span className="truncate hidden sm:inline text-xs">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <span className="truncate sm:hidden text-xs">Wallet</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Wallet Details</DialogTitle>
          <DialogDescription>Your connected wallet information and balance</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wallet Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3">
                <code className="text-xs font-mono truncate text-foreground">{address}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => copyToClipboard(address)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-muted-foreground mt-2">Copied to clipboard!</p>
              )}
            </CardContent>
          </Card>

          {/* Network */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{networkName}</span>
                  {chainId && (
                    <code className="text-xs text-muted-foreground">
                      Chain ID: {parseInt(chainId, 16)}
                    </code>
                  )}
                </div>
                {/* Live indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balance</CardTitle>
              <CardDescription>Current balance on {networkName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Fetching balance…</span>
                  </div>
                ) : balance ? (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground">{balance.formatted}</span>
                    <code className="text-xs text-muted-foreground">{balance.wei} Wei</code>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Could not fetch balance</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Etherscan link */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() =>
              window.open(`https://etherscan.io/address/${address}`, "_blank")
            }
          >
            <ExternalLink className="h-4 w-4" />
            View on Etherscan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}