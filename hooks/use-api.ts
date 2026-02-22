/**
 * useApi Hook
 * 
 * Custom hook to use the API client in components.
 * Provides convenient access to all API methods with error handling.
 */

import { useState, useCallback } from "react"
import apiClient, {
  MintRecordRequest,
  MintRecordResponse,
  GrantAccessRequest,
  GrantAccessResponse,
  GetRecordResponse,
  SystemStatusResponse,
} from "@/lib/api-client"

interface UseApiState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useApi() {
  const [mintState, setMintState] = useState<UseApiState<MintRecordResponse>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const [grantAccessState, setGrantAccessState] = useState<UseApiState<GrantAccessResponse>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const [recordState, setRecordState] = useState<UseApiState<GetRecordResponse>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const [statusState, setStatusState] = useState<UseApiState<SystemStatusResponse>>({
    data: null,
    error: null,
    isLoading: false,
  })

  // Mint medical record
  const mintRecord = useCallback(async (userId: string, request: MintRecordRequest) => {
    setMintState({ data: null, error: null, isLoading: true })
    try {
      const result = await apiClient.mintRecord(userId, request)
      setMintState({ data: result, error: null, isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mint record"
      setMintState({ data: null, error: errorMessage, isLoading: false })
      throw error
    }
  }, [])

  // Grant access to doctor
  const grantAccess = useCallback(async (userId: string, request: GrantAccessRequest) => {
    setGrantAccessState({ data: null, error: null, isLoading: true })
    try {
      const result = await apiClient.grantAccess(userId, request)
      setGrantAccessState({ data: result, error: null, isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to grant access"
      setGrantAccessState({ data: null, error: errorMessage, isLoading: false })
      throw error
    }
  }, [])

  // Get record
  const getRecord = useCallback(async (tokenId: string, doctorAddress: string) => {
    setRecordState({ data: null, error: null, isLoading: true })
    try {
      const result = await apiClient.getRecord(tokenId, doctorAddress)
      setRecordState({ data: result, error: null, isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get record"
      setRecordState({ data: null, error: errorMessage, isLoading: false })
      throw error
    }
  }, [])

  // Get system status
  const getSystemStatus = useCallback(async () => {
    setStatusState({ data: null, error: null, isLoading: true })
    try {
      const result = await apiClient.getSystemStatus()
      setStatusState({ data: result, error: null, isLoading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get system status"
      setStatusState({ data: null, error: errorMessage, isLoading: false })
      throw error
    }
  }, [])

  return {
    // Mint record
    mintRecord,
    mint: mintState,

    // Grant access
    grantAccess,
    grantAccess: grantAccessState,

    // Get record
    getRecord,
    record: recordState,

    // Get system status
    getSystemStatus,
    status: statusState,

    // Auth management
    setAuthToken: apiClient.setAuthToken,
    setPatientSignature: apiClient.setPatientSignature,
    clearAuth: apiClient.clearAuth,
  }
}

export default useApi
