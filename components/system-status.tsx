/**
 * System Status Component
 * 
 * Displays the health and status of the backend system and blockchain connection.
 */

"use client"

import { useState, useEffect } from "react"
import useApi from "@/hooks/use-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Activity, RefreshCw } from "lucide-react"

export function SystemStatus() {
  const { getSystemStatus, status } = useApi()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      getSystemStatus()
      setIsInitialized(true)
    }
  }, [])

  const StatusIndicator = ({ label, isOnline }: { label: string; isOnline: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${isOnline ? "text-green-600" : "text-red-600"}`}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Backend and blockchain health</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => getSystemStatus()}
            disabled={status.isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${status.isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {status.isLoading && !status.data ? (
          <div className="space-y-2 py-4">
            <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : status.data ? (
          <div className="space-y-2">
            <StatusIndicator label="Blockchain RPC" isOnline={status.data.chain === "connected"} />
            <StatusIndicator label="IPFS Gateway" isOnline={status.data.ipfs === "online"} />
            <StatusIndicator
              label="Smart Contract"
              isOnline={status.data.contract !== "not deployed"}
            />

            {status.data.contract && status.data.contract !== "not deployed" && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
                <p className="text-gray-600">Contract Address:</p>
                <p className="font-mono text-xs text-gray-900">{status.data.contract}</p>
              </div>
            )}

            {status.data.contractStatus && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                <p className="text-gray-600">Status Message:</p>
                <p className="font-mono text-xs text-gray-900">{status.data.contractStatus}</p>
              </div>
            )}
          </div>
        ) : status.error ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {status.error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
