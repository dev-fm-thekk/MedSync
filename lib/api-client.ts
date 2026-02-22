/**
 * API Client
 * 
 * This service handles all HTTP requests to the backend API.
 * It provides type-safe methods for each endpoint with proper error handling.
 */

import apiConfig from "./api-config";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MintRecordRequest {
  patientAddress: `0x${string}`;
  encryptedPayload: string;
  metadata?: Record<string, unknown>;
  account: `0x${string}`;
}

export interface MintRecordResponse {
  success: boolean;
  txHash: string;
  receipt: unknown;
  message: string;
}

export interface GrantAccessRequest {
  tokenId: string;
  doctorAddress: string;
  account: `0x${string}`;
  durationSeconds: number;
}

export interface GrantAccessResponse {
  status: string;
  expiry: number;
  txHash: string;
  receipt: unknown;
  message: string;
}

export interface GetRecordResponse {
  accessActive: boolean;
  tokenId: number;
  doctorAddress: string;
  cid: string;
  fileHash: string;
}

export interface SystemStatusResponse {
  chain: string;
  ipfs: string;
  contract: string;
  contractStatus: string;
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    // Get the patient signature or JWT from localStorage
    const signature = localStorage.getItem("x-patient-signature");
    const jwt = localStorage.getItem("auth-token");

    const headers: Record<string, string> = {};

    if (signature) {
      headers["X-Patient-Signature"] = signature;
    } else if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Mint a medical record as an NFT
   */
  async mintRecord(userId: string, request: MintRecordRequest): Promise<MintRecordResponse> {
    try {
      const url = apiConfig.getFullUrl(apiConfig.endpoints.mintRecord(userId));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...apiConfig.defaultHeaders,
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(request),
      });

      const data = await this.handleResponse<MintRecordResponse>(response);
      console.log("[v0] Mint record successful:", data);
      return data;
    } catch (error) {
      console.error("[v0] Mint record error:", error);
      throw error;
    }
  }

  /**
   * Grant access to a doctor for a medical record
   */
  async grantAccess(userId: string, request: GrantAccessRequest): Promise<GrantAccessResponse> {
    try {
      const url = apiConfig.getFullUrl(apiConfig.endpoints.grantAccess(userId));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...apiConfig.defaultHeaders,
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(request),
      });

      const data = await this.handleResponse<GrantAccessResponse>(response);
      console.log("[v0] Grant access successful:", data);
      return data;
    } catch (error) {
      console.error("[v0] Grant access error:", error);
      throw error;
    }
  }

  /**
   * Get a medical record (if authorized)
   */
  async getRecord(tokenId: string, doctorAddress: string): Promise<GetRecordResponse> {
    try {
      const url = apiConfig.getFullUrlWithQuery(apiConfig.endpoints.getRecord(tokenId), {
        doctorAddress,
      });
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...apiConfig.defaultHeaders,
          ...this.getAuthHeader(),
        },
      });

      const data = await this.handleResponse<GetRecordResponse>(response);
      console.log("[v0] Get record successful:", data);
      return data;
    } catch (error) {
      console.error("[v0] Get record error:", error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatusResponse> {
    try {
      const url = apiConfig.getFullUrl(apiConfig.endpoints.systemStatus);
      const response = await fetch(url, {
        method: "GET",
        headers: apiConfig.defaultHeaders,
      });

      const data = await this.handleResponse<SystemStatusResponse>(response);
      console.log("[v0] System status:", data);
      return data;
    } catch (error) {
      console.error("[v0] System status error:", error);
      throw error;
    }
  }

  /**
   * Set authentication token (for Bearer JWT)
   */
  setAuthToken(token: string): void {
    localStorage.setItem("auth-token", token);
  }

  /**
   * Set patient signature (for X-Patient-Signature header)
   */
  setPatientSignature(signature: string): void {
    localStorage.setItem("x-patient-signature", signature);
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("x-patient-signature");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
