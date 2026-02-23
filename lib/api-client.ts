/**
 * API Client
 * 
 * This service handles all HTTP requests to the backend API.
 * It provides type-safe methods for each endpoint with proper error handling.
 */

import apiConfig from "./api-config"
import {
  grantViewerRoleOnChain,
  hasAccessOnChain,
  mintRecordOnChain,
  getTokenUriOnChain,
} from "./medical-vault-contract"
import type { Address } from "viem"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface MintRecordRequest {
  patientAddress: `0x${string}`
  encryptedPayload: string
  metadata?: Record<string, unknown>
  account: `0x${string}`
}

export interface MintRecordResponse {
  success: boolean
  txHash: string
  receipt: unknown
  message: string
}

export interface GrantAccessRequest {
  tokenId: string
  doctorAddress: string
  account: `0x${string}`
  durationSeconds: number
}

export interface GrantAccessResponse {
  status: string
  expiry: number
  txHash: string
  receipt: unknown
  message: string
}

export interface GetRecordResponse {
  accessActive: boolean
  tokenId: number
  doctorAddress: string
  cid: string
  fileHash: string
}

export interface SystemStatusResponse {
  chain: string
  ipfs: string
  contract: string
  contractStatus: string
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    // Get the patient signature or JWT from localStorage
    const signature = localStorage.getItem("x-patient-signature")
    const jwt = localStorage.getItem("auth-token")

    const headers: Record<string, string> = {}

    if (signature) {
      headers["X-Patient-Signature"] = signature
    } else if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Mint a medical record as an NFT directly on-chain (Sepolia)
   */
  async mintRecord(userId: string, request: MintRecordRequest): Promise<MintRecordResponse> {
    try {
      console.log("[viem] Mint record for user:", userId)

      const { hash, receipt } = await mintRecordOnChain({
        patientAddress: request.patientAddress as Address,
        cid: request.encryptedPayload,
        account: request.account as Address,
      })

      const data: MintRecordResponse = {
        success: true,
        txHash: hash,
        receipt,
        message: "Record minted successfully on-chain",
      }

      console.log("[viem] Mint record successful:", data)
      return data
    } catch (error) {
      console.error("[viem] Mint record error:", error)
      throw error
    }
  }

  /**
   * Grant access to a doctor for a medical record directly on-chain (Sepolia)
   */
  async grantAccess(userId: string, request: GrantAccessRequest): Promise<GrantAccessResponse> {
    try {
      console.log("[viem] Grant access for user:", userId)

      const nowSeconds = Math.floor(Date.now() / 1000)
      const expiry = nowSeconds + request.durationSeconds

      const { hash, receipt } = await grantViewerRoleOnChain({
        tokenId: BigInt(request.tokenId),
        doctorAddress: request.doctorAddress as Address,
        durationSeconds: BigInt(request.durationSeconds),
        account: request.account as Address,
      })

      const data: GrantAccessResponse = {
        status: "success",
        expiry,
        txHash: hash,
        receipt,
        message: "Access granted successfully on-chain",
      }

      console.log("[viem] Grant access successful:", data)
      return data
    } catch (error) {
      console.error("[viem] Grant access error:", error)
      throw error
    }
  }

  /**
   * Get a medical record (if authorized) by reading on-chain state
   */
  async getRecord(tokenId: string, doctorAddress: string): Promise<GetRecordResponse> {
    try {
      const tokenIdBigInt = BigInt(tokenId)
      const accessActive = await hasAccessOnChain({
        tokenId: tokenIdBigInt,
        doctorAddress: doctorAddress as Address,
      })

      let cid = ""
      try {
        cid = await getTokenUriOnChain(tokenIdBigInt)
      } catch {
        cid = ""
      }

      const data: GetRecordResponse = {
        accessActive,
        tokenId: Number(tokenIdBigInt),
        doctorAddress,
        cid,
        fileHash: "",
      }

      console.log("[viem] Get record successful:", data)
      return data
    } catch (error) {
      console.error("[viem] Get record error:", error)
      throw error
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatusResponse> {
    try {
      const url = apiConfig.getFullUrl(apiConfig.endpoints.systemStatus)
      const response = await fetch(url, {
        method: "GET",
        headers: apiConfig.defaultHeaders,
      })

      const data = await this.handleResponse<SystemStatusResponse>(response)
      console.log("[v0] System status:", data)
      return data
    } catch (error) {
      console.error("[v0] System status error:", error)
      throw error
    }
  }

  /**
   * Set authentication token (for Bearer JWT)
   */
  setAuthToken(token: string): void {
    localStorage.setItem("auth-token", token)
  }

  /**
   * Set patient signature (for X-Patient-Signature header)
   */
  setPatientSignature(signature: string): void {
    localStorage.setItem("x-patient-signature", signature)
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("x-patient-signature")
  }
}

export const apiClient = new ApiClient()
export default apiClient
