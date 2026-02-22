"use client"

import { useState, useEffect } from "react"
import { BrowserProvider, formatEther } from "ethers"
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
  balance: string
  formattedBalance: string
}

export function WalletDetails() {
  const { walletAddress, chainId } = useAuth()
  const [balanceData, setBalanceData] = useState<WalletBalance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Get wallet details
  const displayAddress = walletAddress || "No wallet connected"
  const displayChainId = chainId || "unknown"

  // Map chain ID to network name
  const getNetworkName = (chainId: number | null): string => {
    const networkMap: Record<number, string> = {
      1: "Ethereum Mainnet",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
      137: "Polygon",
      80001: "Mumbai Testnet",
      42161: "Arbitrum One",
      421613: "Arbitrum Goerli",
      10: "Optimism",
      420: "Optimism Goerli",
      56: "BSC",
      97: "BSC Testnet",
    }
    return chainId ? (networkMap[chainId] || `Chain ${chainId}`) : "Unknown"
  }

  // Fetch wallet balance from blockchain
  useEffect(() => {
    if (!walletAddress || typeof window === "undefined" || !window.ethereum) return

    const fetchBalance = async () => {
      setIsLoading(true)
      try {
        const provider = new BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(walletAddress)
        const formattedBalance = `${formatEther(balance).slice(0, 6)} ETH`

        setBalanceData({
          balance: balance.toString(),
          formattedBalance,
        })
      } catch (error) {
        console.error("[v0] Error fetching balance:", error)
        setBalanceData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [walletAddress])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!walletAddress) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>No wallet connected</span>
      </div>
    )
  }

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
            {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
          </span>
          <span className="truncate sm:hidden text-xs">Wallet</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Wallet Details</DialogTitle>
          <DialogDescription>
            Your connected wallet information and balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wallet Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3">
                <code className="text-xs font-mono truncate text-foreground">
                  {displayAddress}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => copyToClipboard(displayAddress)}
                  title="Copy address"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-muted-foreground mt-2">Copied to clipboard!</p>
              )}
            </CardContent>
          </Card>

          {/* Wallet ID Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wallet ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3">
                <code className="text-xs font-mono truncate text-foreground">
                  {walletId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => copyToClipboard(walletId)}
                  title="Copy wallet ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {getNetworkName(chainId)}
                  </span>
                  <code className="text-xs text-muted-foreground">Chain ID: {chainId}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balance</CardTitle>
              <CardDescription>
                Current balance on this network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Fetching balance...</span>
                  </div>
                ) : balanceData ? (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground">
                      {balanceData.formattedBalance}
                    </span>
                    <code className="text-xs text-muted-foreground">
                      {balanceData.balance} Wei
                    </code>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No balance data available</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View on Explorer */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() =>
              window.open(
                `https://etherscan.io/address/${displayAddress}`,
                "_blank"
              )
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
